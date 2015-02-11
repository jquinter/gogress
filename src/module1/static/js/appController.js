angular.module('goGress').controller('AppController', [
  '$scope', 
  '$mdSidenav', 
  '$log',
  '$auth',
  'deviceInfoService', 
  function($scope, $mdSidenav, $log, $auth, deviceInfoService) {
    $scope.device_screen_data = deviceInfoService.getDeviceScreenData();
    $scope.sys_config = [];
    
    $scope.sys_config.font = "Coda"; //Roboto ???
    $scope.sys_config.font = "Roboto"; //Coda ???

    $scope.auth = $auth
    $scope.authenticate = function(provider){
      $auth.authenticate(provider);
    }
    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle()
        .then(function() {
          $log.debug("toggle left is done");
        });
    };
}]);

