app = angular.module('inputBasicDemo', ['ngMaterial', 'ngMessages', 'ngResource', 'ngRoute']);
app.factory('Portal', function($resource) {
  return $resource('/api/portal/:id', {
    id: '@title'
  });
})
app.config(function($mdThemingProvider, $routeProvider, $locationProvider, $resourceProvider) {
  $mdThemingProvider.theme('default');
  $routeProvider
    .when('/portal/', {
      templateUrl: 'tmpl/portal_list.html',
      controller: 'PortalListController'/*,
      resolve: {
        // I will cause a 1 second delay
        delay: function($q, $timeout) {
          var delay = $q.defer();
          $timeout(delay.resolve, 1000);
          return delay.promise;
        }
      }*/
    })
  $resourceProvider.defaults.stripTrailingSlashes = false;
  $locationProvider.html5Mode(true);
});

app.controller('PortalListController', function($scope, Portal){
  $scope.items = Portal.query();
})
app.controller('PortalController', function($scope, Portal, $mdDialog) {
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
});

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}