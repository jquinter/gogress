angular.module('goGress').controller('PortalController', ['$scope', '$rootScope', 'Portal', '$mdDialog', function($scope, $rootScope, Portal, $mdDialog) {
  $scope.portals = [];

  $scope.procesa = function(many, answer){
    if (many)
      return $scope.processGameEntities(answer);
    else
      return $scope.processPortal(answer);
  };
  $scope.showProcessDialog = function(ev) {
    $mdDialog.show({
        // controller: DialogController,
        templateUrl: '/tmpl/portalParseDialog.tmpl.html',
        targetEvent: ev,
        resolve: {
          fn: function() {
            return $scope.procesa;
          }
        },
        controller: function ($scope, $mdDialog, fn) {
          $scope.hide = function() {
            $mdDialog.hide();
          };
          $scope.cancel = function() {
            $mdDialog.cancel();
          };
          $scope.answer = function(many, answer) {
            fn(many, answer);
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
  $scope.processPortal = function(rawData) {
    var portalData = JSON.parse(rawData);
    $scope.portal = {
      id: portalData.b,
      lat: portalData.result[2],
      lon: portalData.result[3],
      image: portalData.result[7],
      title: portalData.result[8]
    }
  }
  $scope.processGameEntities = function(rawData) {
    var portalData = JSON.parse(rawData);
    $scope.importPortals = []
    for (key in portalData.result.map){
      var entities = portalData.result.map[key]
      for (var i=0; i<entities.gameEntities.length; i++){
        var ent = entities.gameEntities[i];
        if (ent[2][0] != 'p') continue;
        $scope.importPortals.push({ 
        id: ent[0],
        title: ent[2][8],
        lat: ent[2][2],
        lon: ent[2][3],
        image: ent[2][7]})
      }
    }
  }
  $scope.import = function(){
    for (var i=0; i<$scope.importPortals.length; i++){
      Portal.save($scope.importPortals[i]);
    }
    //Portal.import($scope.importPortals);
  }
  $scope.savePortal = function() {
    guardar = Portal.save($scope.portal);
    guardar.$promise["finally"](function(){
      console.log("finally");
    });
    guardar.$promise["then"](function(){
      console.log("then");
    })
    guardar.$promise["catch"](function(){
      console.log("catch");
    })
  }
}]);

angular.module('portal.directives', [])
  .directive('portalTitle', function () {
    return {
      restrict: 'E',
      scope: {
        portalInfo: "=portalInfo"
      },
      templateUrl: 'partials/portal-title.html',
    };
  })
  .directive('portalView', function () {
    return {
      restrict: 'E',
      templateUrl: 'partials/portal-view.html',
      controller: function ($scope) {
        $scope.selectedIndex = 1;
      }
    };
  });


