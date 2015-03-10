angular.module('goGress').controller('PortalController', [
  '$scope',  '$filter',  '$rootScope',  'PortalFactory',  '$mdDialog',  '$q',
  function($scope, $filter, $rootScope, Portal, $mdDialog, $q) {
    $scope.portal = {};
    $scope.portals = [];

    $scope.procesa = function(many, answer, portalid) {
      if (many)
        return $scope.processGameEntities(answer);
      else
        return $scope.processPortal(answer, portalid);
    };
    $scope.showProcessDialog = function(ev) {
      $mdDialog.show({
        // controller: DialogController,
        templateUrl: '/tmpl/portalParseDialog.tmpl.html',
        targetEvent: ev,
        locals: {
          portalid: $scope.portal.id
        },
        resolve: {
          fn: function() {
            return $scope.procesa;
          }
        },
        controller: function($scope, $mdDialog, fn, portalid) {
            $scope.import_multi = false;
            $scope.portal_id = portalid;
            $scope.hide = function() {
              $mdDialog.hide();
            };
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            $scope.answer = function(many, answer, portalid) {
              fn(many, answer, portalid);
              $mdDialog.hide();
            };
          }
          // })
          // .then(function(many, answer) {
          //   console.log(many);
          //   if (many)
          //     $scope.processGameEntities(answer);
          //   else
          //     $scope.processPortal(answer);
          //   //$scope.alert = 'You said the information was "' + answer + '".';
          // }, function() {
          //   //$sccope.alert = 'You cancelled the dialog.';
      });
    }
    $scope.processPortal = function(rawData, portalid) {
      try{
        var portalData = JSON.parse(rawData);
      }catch(e){
        $scope.openToast("Creo que hubo un problema... " + e);
        return;
      }
      $scope.portal = {
        id: portalid,
        lat: portalData.result[2],
        lon: portalData.result[3],
        image: portalData.result[7],
        title: portalData.result[8]
      }
    }
    $scope.processGameEntities = function(rawData) {
      try{
        var portalData = JSON.parse(rawData);
      }catch(e){
        $scope.openToast("Creo que hubo un problema... " + e);
        return;
      }
      console.log(portalData.result.map);
      $scope.importPortals = []
      for (key in portalData.result.map) {
        var entities = portalData.result.map[key]
        for (var i = 0; i < entities.gameEntities.length; i++) {
          var ent = entities.gameEntities[i];
          if (ent[2][0] != 'p') continue;
          $scope.importPortals.push({
            id: ent[0],
            title: ent[2][8],
            lat: ent[2][2],
            lon: ent[2][3],
            image: ent[2][7]
          })
        }
      }
      $scope.import();
    }
    $scope.import = function() {
      Portal.import($scope.importPortals).$promise.then(function(){
        $scope.openToast("Se han cargado todos los portales, pegate un palmaso en la espalda :P");
      }).catch(function(){
        $scope.openToast("Creo que hubo un problema");
      })
    }
    $scope.savePortal = function() {
      guardar = Portal.save($scope.portal);
      guardar.$promise["finally"](function() {
      });
      guardar.$promise["then"](function() {
        $scope.openToast("El portal se ha guardado.");
        return false;
      })
      guardar.$promise["catch"](function(error) {
        var msje = "No se puede guardar el portal";
        if(error.status == 403){
          msje += ": parece un problema de permisos. Intente saliendo y entrando nuevamente con su cuenta.";
        }else{
          msje += " ["+error.data+"]";

        }
        $scope.openToast(msje);
        return false;
      })
    }
    $scope.showPortal = function(item) {
      $scope.selectedPortal = item;
    }
    $scope.addLabel = function(label) {
      if (!$scope.portal) return;

      clean_label = $filter('sanitizelabel')(label);

      if (!$scope.portal.labels) $scope.portal.labels = [];
      if ($scope.portal.labels.indexOf(clean_label) == -1) {
        $scope.portal.labels.push(clean_label);
      }
    }
    $scope.deleteLabel = function(label) {
      if (!$scope.portal) return;
      if (!$scope.portal.labels) $scope.portal.labels = [];

      var pos = $scope.portal.labels.indexOf(label);
      if (pos >= 0) {
        $scope.portal.labels.splice(pos, 1);
      }
    }

  }
]);

angular.module('portal.directives', [])
  .directive('portalTitle', function() {
    return {
      restrict: 'E',
      scope: {
        portalInfo: "=portalInfo"
      },
      templateUrl: 'partials/portal-title.html',
    };
  })
  .directive('portalView', function() {
    return {
      restrict: 'E',
      templateUrl: 'partials/portal-view.html',
      controller: function($scope) {
        $scope.selectedIndex = 2;
      }
    };
  });