app = angular.module('goGress', [
  'ngMaterial',
  'ngMessages',
  'ngResource',
  'ngRoute',
  'portal.directives',
  'uiGmapgoogle-maps',
  'satellizer'
]);
app.factory('Portal', function($resource) {
  var cursor = '';
  var resource = $resource('/api/portal/:id', {
    id: '@id'
  }, {
    'get': {
      method: 'GET'
    },
    'save': {
      method: 'POST'
    },
    'query': {
      method: 'GET',
      isArray: true,
      transformResponse: function(data, headerGetter){
        if (headerGetter().cursor)
          cursor = headerGetter().cursor;
        return JSON.parse(data);
      }
    },
    'remove': {
      method: 'DELETE'
    },
    'delete': {
      method: 'DELETE'
    },
    'import': {
      url: '/api/portals/',
      method: 'POST'
    }
  });
  resource.$getCursor = function(){
    return cursor;
  }
  resource.$clearCursor = function(){
    cursor = '';
  }
  return resource;
})
app.factory('Operation', function($resource) {
  return $resource('/api/op/:id', {
    id: '@id'
  });
})
app.factory('Agent', function($resource) {
  return $resource('/api/agent/:id', {
    id: '@id'
  });
})
app.factory('Label', function($resource) {
  return $resource('/api/label/:label', {
    label: '@label'
  });
})
app.config(function($authProvider, $mdThemingProvider, $routeProvider, $locationProvider, $resourceProvider) {
  $authProvider.google({
    clientId: '164620448986-olal315lm7t73p7qgp47isa5jl31le8r.apps.googleusercontent.com'
  });
  $mdThemingProvider.theme('green')
    .primaryPalette('teal')
    .accentPalette('lime');

  var cyanIngressPalette = $mdThemingProvider.extendPalette('cyan', {
    'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                        // on this palette should be dark or light
    'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
     '200', '300', '400', 'A100'],
    'contrastLightColors': ['50', '100', //hues which contrast should be 'light' by default
     '200', '300', '400', 'A100'],    // could also specify this if default was 'dark'
  });
  // Register the new color palette map with the name <code>neonRed</code>
  $mdThemingProvider.definePalette('cyanIngress', cyanIngressPalette);

  $mdThemingProvider.theme('ingress')
    .primaryPalette('cyanIngress', {
      'default': '700', // by default use shade 400 from the pink palette for primary intentions
      'hue-1': '300', // use shade 100 for the <code>md-hue-1</code> class
      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
      'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
    }) //most similar to #59fbea
    .accentPalette('yellow')
    .warnPalette('orange')
    .dark();
  $mdThemingProvider.setDefaultTheme('green');
  $mdThemingProvider.alwaysWatchTheme(true);

  $routeProvider
    .when('/portals/', {
      templateUrl: 'tmpl/portal_list.html',
      controller: 'PortalListController'
    })
    .when('/portals/labelled/:label', {
      templateUrl: 'tmpl/portal_list.html',
      controller: 'PortalListController'
    })
    .when('/portal/:id', {
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
    .when('/agents/add', {
      templateUrl: 'tmpl/agent_edit.html',
      controller: 'AgentListController'
    })
    .when('/agents/:id', {
      templateUrl: 'tmpl/agent_edit.html',
      controller: 'AgentListController'
    })
    .when('/labels/', {
      templateUrl: 'tmpl/label_list.html',
      controller: 'LabelListController'
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

app.factory('deviceInfoService', ['$window', function($window) {
  var device_screen_data_label = ['width', 'height', 'availWidth', 'availHeight', 'colorDepth', 'pixelDepth'];
  var device_screen_data = {};
  for (var i = 0; i < device_screen_data_label.length; i++) {
    device_screen_data[device_screen_data_label[i]] = (screen[device_screen_data_label[i]]);
  }

  function getDeviceScreenData() {
    return device_screen_data;
  }

  return {
    getDeviceScreenData: getDeviceScreenData
  };

}]);

app.factory('LabelService', ['Label', function(Label) {
  var labels = Label.query();
  return {
    labels: labels
  };
}]);

app.filter('sanitizecodename', function () {
  return function (input) {
    if (!input) return "";

    input = input
            .replace(/^@*/g, '');
    return input;
  }
})
.filter('normalizecodename', ['$filter', function ($filter) {
  return function (input) {
    var legalcodename = "@" + $filter('sanitizecodename')(input);
    return legalcodename;
  };
}])
.filter('sanitizelabel', function () {
  return function (input) {
    if (!input) return "";

    input = input
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/\W+/g, '')
            .replace(/^#*/g, '');
    return input;
  }
})
.filter('normalizelabel', ['$filter', function ($filter) {
  return function (input) {
    var legallabel = "#" + $filter('sanitizelabel')(input);
    return legallabel;
  };
}]);

