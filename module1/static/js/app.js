app = angular.module('inputBasicDemo', ['ngMaterial', 'ngMessages'])
  .controller('DemoCtrl', function($scope) {
    $scope.portals = [];
    $scope.processPortal = function(rawData) {
      var portalData = JSON.parse(rawData);
      var newPortal = {
        lat: portalData.result[2],
        lon: portalData.result[3],
        image: portalData.result[7],
        title: portalData.result[8]
      }
      $scope.portals.push(newPortal);
    }
  });
app.factory('Portal', function($resource) {
  return $resource('localhost:8080/api/portal');
})
app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default');
});