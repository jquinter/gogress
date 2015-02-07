app = angular.module('inputBasicDemo', ['ngMaterial', 'ngMessages', 'ngResource', 'ngRoute', 'uiGmapgoogle-maps', 'satellizer']);
app.factory('Portal', function($resource) {
  return $resource('/api/portal/:id', {
    id: '@title'
  });
})
app.factory('Operation', function($resource) {
  return $resource('/api/op/:id', {
    id: '@id'
  });
})
app.config(function($authProvider, $mdThemingProvider, $routeProvider, $locationProvider, $resourceProvider) {
  $authProvider.google({
    clientId: '164620448986-olal315lm7t73p7qgp47isa5jl31le8r.apps.googleusercontent.com'  });
  $mdThemingProvider.theme('default');
  $routeProvider
    .when('/portals/', {
      templateUrl: 'tmpl/portal_list.html',
      controller: 'PortalListController'
    })
    .when('/portals/edit/:id', {
      templateUrl: 'tmpl/portal_edit.html',
      controller: 'PortalController'
    })
    .when('/portals/add', {
      templateUrl: 'tmpl/portal_edit.html',
      controller: 'PortalController'
    })
    .when('/agents/', {
      templateUrl: 'tmpl/agent_list.html',
      controller: 'AgentListController'
    })
    .when('/ops', {
      templateUrl: 'tmpl/op_list.html',
      controller: 'OperationListController'
    })
    .when('/ops/add', {
      templateUrl: 'tmpl/op_edit.html',
      controller: 'OperationController'
    })
  $resourceProvider.defaults.stripTrailingSlashes = false;
  $locationProvider.html5Mode(true);
});

app.controller('AppController', function($scope, $mdSidenav, $log, $auth) {
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
})
app.controller('PortalListController', function($scope, Portal) {
  $scope.map = {
    center: {
      latitude: 45,
      longitude: -73
    },
    zoom: 15
  };
  $scope.viewPortal = false;
  $scope.hidePortal = function() {
    $scope.viewPortal = false;
  }
  $scope.showPortal = function(portal) {
    $scope.viewPortal = true;
    $scope.portal = portal;
  }
  $scope.showMap = function(portal) {
    $scope.map.center.latitude = portal.lat / 1000000;
    $scope.map.center.longitude = portal.lon / 1000000;
    $scope.markers = [{
      id: 1,
      latitude: $scope.map.center.latitude,
      longitude: $scope.map.center.longitude,
      title: portal.title
    }];
    $scope.viewMap = true;
  }
  $scope.hideMap = function() {
    $scope.viewMap = false;
  }
  $scope.savePortal = function() {
    Portal.save($scope.portal)
  }
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
app.controller('OperationListController', function($scope, Operation) {
  $scope.items = Operation.query();
})


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