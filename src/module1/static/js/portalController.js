angular.module('goGress').controller('PortalController', ['$scope', '$rootScope', 'Portal', '$mdDialog', function($scope, $rootScope, Portal, $mdDialog) {
  $scope.portals = [];
  $scope.showProcessDialog = function(ev) {
    $mdDialog.show({
        controller: DialogController,
        templateUrl: '/tmpl/portalParseDialog.tmpl.html',
        targetEvent: ev,
      })
      .then(function(answer) {
        $scope.processPortal(answer);
        //$scope.alert = 'You said the information was "' + answer + '".';
      }, function() {
        //$sccope.alert = 'You cancelled the dialog.';
      });
  }
  $scope.processPortal = function(rawData) {
    var portalData = JSON.parse(rawData);
    $scope.portal = {
      lat: portalData.result[2],
      lon: portalData.result[3],
      image: portalData.result[7],
      title: portalData.result[8]
    }
  }
  $scope.savePortal = function() {
    Portal.save($scope.portal);
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


