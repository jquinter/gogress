angular.module('goGress').controller('DefaultController', [
  '$scope', 
  '$rootScope', 
  'Portal', 
  '$mdDialog', 
  'deviceInfoService', 
  function($scope, $rootScope, Portal, $mdDialog, deviceInfoService) {
    $scope.data = deviceInfoService.getDeviceScreenData();
}]);
