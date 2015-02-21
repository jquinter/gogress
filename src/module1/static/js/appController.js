angular.module('goGress').controller('AppController', [
  '$scope',
  '$mdDialog',
  '$mdSidenav',
  '$mdToast',
  '$log',
  '$auth',
  function($scope, $mdDialog, $mdSidenav, $mdToast, $log, $auth) {
    $scope.sys_config = {};
    $scope.sys_config.font = "Coda"; //Roboto ???
    $scope.sys_config.font = "Roboto"; //Coda ???
    $scope.auth = $auth
    $scope.sys_config.allow_sidebar_left_locked_open = true;
    $scope.sys_config.allow_sidebar_right_locked_open = true;
    $scope.sys_config.toggle_theme = true;
    $scope.sys_config.theme = "green";
    $scope.sys_config.zoom_level = 14;
    $scope.sys_config.zoom_level_refs = [
      { zoom: 0, ref:"Mundo" },
      { zoom: 9, ref:"Región" },
      { zoom: 13, ref:"Ciudad" },
      { zoom: 14, ref:"Comuna" },
      { zoom: 18, ref:"Villa" },
      { zoom: 20, ref:"Calle/Pasaje" },
      { zoom: 21, ref:"OMG" }
    ]

    $scope.$watchCollection('sys_config', function(newValues, oldValues) {
      if($scope.sys_config.toggle_theme){
        $scope.sys_config.theme = "green";
      }else{
        $scope.sys_config.theme = "ingress";
      }
    });

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider);
    }
    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle()
        .then(function() {
          $log.debug("toggle left is done");
        });
    };
    $scope.toggleRight = function() {
      $mdSidenav('right').toggle()
        .then(function() {
          $log.debug("toggle right is done");
        });
    };
    $scope.closeLeft= function() {
      target = "left";
      if( $mdSidenav( target ).isLockedOpen() ){
        $log.debug("toogle " + target + " is locked open");
        var allow = "allow_sidebar_"+target+"_locked_open";
        $scope.sys_config[allow] = false;
      }
      $mdSidenav( target ).close()
        .then(function() {
          $log.debug("toggle " + target + " has been closed");
        });
    };
    $scope.closeRight = function() {
      if( $mdSidenav('right').isLockedOpen() ){
        $log.debug("toogle right is locked open");
        $scope.sys_config.allow_sidebar_right_locked_open = false;
      }
      $mdSidenav('right').close()
        .then(function() {
          $log.debug("toggle right has been closed");
        });
    };
    $scope.querySearch = function( query ) {
      $log.debug("Llamando a la funcion querySearch (@AppController) ... preguntando por " + query);
      if(query){
        contieneLabels = query.indexOf("#");
        if(contieneLabels >= 0){
          //hay que separar la consultas, por #, generar un arreglo
          labels = query.split("#");
          labels.shift(); //el elemento 0 es el inicio de la query
          $log.debug(labels);
        }
      }
      return [];
    }

    $scope.openToast = function(msg) {
      $mdToast.show(
        $mdToast.simple()
        .position("top right")
        .theme($scope.sys_config.theme)
        .content(msg)
        .hideDelay(400000)
      );
    };

    $scope.showPictures = function($event) {
      $mdDialog.show({
        targetEvent: $event,
        templateUrl: 'partials/image-dialog.tpl.html',
        controller: 'ImageViewerController',
        controllerAs: 'imgViewerVm',
        locals: {
            portal: this.portal
        }
      });
    }

    $scope.copyToClipboard = function(text) {
      window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    }

    $scope.getBoundsZoomLevel = function(bounds, mapDim) {
        var WORLD_DIM = { height: 256, width: 256 };
        var ZOOM_MAX = 21;

        function latRad(lat) {
            var sin = Math.sin(lat * Math.PI / 180);
            var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
            return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
        }

        function zoom(mapPx, worldPx, fraction) {
            return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
        }

        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();

        var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

        var lngDiff = ne.lng() - sw.lng();
        var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

        var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
        var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

        return Math.min(latZoom, lngZoom, ZOOM_MAX);
    }

  }
]);
