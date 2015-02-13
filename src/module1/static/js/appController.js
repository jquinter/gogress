angular.module('goGress').controller('AppController', [
  '$scope',
  '$mdSidenav',
  '$log',
  '$auth',
  function($scope, $mdSidenav, $log, $auth) {
    $scope.sys_config = {};
    $scope.sys_config.font = "Coda"; //Roboto ???
    $scope.sys_config.font = "Roboto"; //Coda ???
    $scope.auth = $auth
    $scope.sys_config.allow_sidebar_right_locked_open = true;
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
    $scope.querySearch= function( query ) {
      $log.debug("Llamando a la funcion querySearch (@AppController) ... preguntando por " + query)
      return [];
    }
  }
]);
