app = angular.module('goGress', [
  'gogress.services',
  'ngMaterial', 
  'ngMessages', 
  'ngResource', 
  'ngRoute', 
  'portal.directives',
  'portal_list.directives',
  'uiGmapgoogle-maps', 
  'satellizer'
  ]);
app.factory('Portal', function($resource) {
  return $resource('/api/portal/:id', {
    id: '@id'
  });
})
app.factory('Operation', function($resource) {
  return $resource('/api/op/:id', {
    id: '@id'
  });
})
app.factory('Agent', function($resource) {
  return $resource('/api/agent/:id', {
    id: '@name'
  });
})
app.config(function($authProvider, $mdThemingProvider, $routeProvider, $locationProvider, $resourceProvider) {
  $authProvider.google({
    clientId: '164620448986-olal315lm7t73p7qgp47isa5jl31le8r.apps.googleusercontent.com'
  });
  $mdThemingProvider.theme('green')
    .primaryPalette('teal')
    .accentPalette('lime');
  //$mdThemingProvider.alwaysWatchTheme(true);
  $mdThemingProvider.setDefaultTheme('green');

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
    .when('/portals/import', {
      templateUrl: 'tmpl/portal_import.html',
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
    .when('/dev_info/', {
      templateUrl: 'tmpl/default.html',
      controller: 'DefaultController'
    })
    .otherwise({
      templateUrl: 'tmpl/nelson.html',
    })
  $resourceProvider.defaults.stripTrailingSlashes = false;
  $locationProvider.html5Mode(true);
});
