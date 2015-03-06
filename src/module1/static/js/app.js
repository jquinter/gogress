app = angular.module('goGress', [
  'ngMaterial',
  'ngMessages',
  'ngResource',
  'portal.directives',
  'uiGmapgoogle-maps',
  'satellizer',
  'matchMedia',
  'ui.router'
]);
app.factory('Portal', function($resource, UserDataService) {
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
      transformResponse: function(data, headerGetter) {
        if (headerGetter().cursor)
          cursor = headerGetter().cursor;
        var portals = JSON.parse(data);
        if (UserDataService.userData.$resolved) {
          var favs = UserDataService.userData.favourites.slice();
          for (var i = 0; portals && i < portals.length && favs && favs.length > 0; i++) {
            for (var j = 0; j < favs.length; j++) {
              if (favs[j] == portals[i].id) {
                portals[i].favourite = true;
                console.log(favs)
                favs.splice(j, 1)
                console.log(favs)
                break;
              }
            }
          }
        }
        return portals
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
  resource.$getCursor = function() {
    return cursor;
  }
  resource.$clearCursor = function() {
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

app.factory('UserData', function($resource) {
  return $resource('/api/userdata/', {}, {
    'get': {
      method: 'GET',
      transformResponse: function(raw) {
        if (raw) {
          var data = JSON.parse(raw);
          data.favourites = data.favourites || []
          data.sys_config = JSON.parse(data.sys_config) || {}
          return data
        }
        return {}
      }
    },
    'save': {
      method: 'POST'
    }
  });
})

app.config(function($mdIconProvider) {
  $mdIconProvider
    .iconSet('action' , 'js/components/material-design-icons/sprites/svg-sprite/svg-sprite-action.svg', 24)
    .iconSet('content', 'js/components/material-design-icons/sprites/svg-sprite/svg-sprite-content.svg', 24)
    .iconSet('maps'   , 'js/components/material-design-icons/sprites/svg-sprite/svg-sprite-maps.svg', 24)
    .iconSet('ingress', 'img/svg-sprite-ingress.svg', 24)
    .defaultIconSet('js/components/material-design-icons/sprites/svg-sprite/svg-sprite-navigation.svg', 24);
});


app.config(function($authProvider, $mdThemingProvider, $stateProvider, $urlRouterProvider, $locationProvider, $resourceProvider) {
  $authProvider.google({
    clientId: '164620448986-olal315lm7t73p7qgp47isa5jl31le8r.apps.googleusercontent.com'
  });
  $mdThemingProvider.theme('green')
    .primaryPalette('teal')
    .accentPalette('lime');

  var cyanIngressPalette = $mdThemingProvider.extendPalette('cyan', {
    'contrastDefaultColor': 'light', // whether, by default, text (contrast)
    // on this palette should be dark or light
    'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
      '200', '300', '400', 'A100'
    ],
    'contrastLightColors': ['50', '100', //hues which contrast should be 'light' by default
      '200', '300', '400', 'A100'
    ], // could also specify this if default was 'dark'
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
  //$urlRouterProvider.otherwise("/");
  //      templateUrl: 'tmpl/nelson.html',

  $stateProvider
    .state('portal', {
      url: '/portals',
      templateUrl: 'tmpl/portal_list.html',
      controller: 'PortalListController',
      reloadOnSearch: true,
      title: "Portales"
    })
    .state('portal.list.label', {
      url: '/portals/labelled/:label',
      templateUrl: 'tmpl/portal_list.html',
      controller: 'PortalListController',
      reloadOnSearch: true
    })
    .state('portal.view', {
      url: '/portal/:id',
      templateUrl: 'tmpl/portal_list.html',
      controller: 'PortalListController'
    })
    .state('portal.edit', {
      url: '/portals/edit/:id',
      templateUrl: 'tmpl/portal_edit.html',
      controller: 'PortalController'
    })
    .state('portal.add', {
      url: '/portals/add',
      templateUrl: 'tmpl/portal_edit.html',
      controller: 'PortalController'
    })
    .state('portal.import', {
      url: '/portals/import',
      templateUrl: 'tmpl/portal_import.html',
      controller: 'PortalController'
    })
    .state('agent', {
      url: '/agents/',
      templateUrl: 'tmpl/agent_list.html',
      controller: 'AgentListController',
      title: "Agentes"
    })
    .state('agent_add', {
      url: '/agents/add',
      templateUrl: 'tmpl/agent_edit.html',
      controller: 'AgentListController'
    })
    .state('agent_view', {
      url: '/agents/:id',
      templateUrl: 'tmpl/agent_edit.html',
      controller: 'AgentController',
      resolve: {
        agent: function(Agent, $stateParams) {
          return Agent.get({
            id: $stateParams.id
          }).$promise
        }
      }
    })

  .state('label.list', {
    url: '/labels/',
    templateUrl: 'tmpl/label_list.html',
    controller: 'LabelListController'
  })
    .state('ops', {
      url: '/ops',
      templateUrl: 'tmpl/op_list.html',
      controller: 'OperationListController'
    })
    .state('op.view', {
      url: '/ops/:id',
      templateUrl: 'tmpl/op_edit.html',
      controller: 'OperationController'
    })
    .state('op.add', {
      url: '/ops/add',
      templateUrl: 'tmpl/op_edit.html',
      controller: 'OperationController'
    })
    .state('dev', {
      url: '/dev_info/',
      templateUrl: 'tmpl/default.html',
      controller: 'DefaultController'
    })
    .state('settings', {
      url: '/settings/',
      templateUrl: 'partials/settings.html'
    })
  $resourceProvider.defaults.stripTrailingSlashes = false;
  $locationProvider.html5Mode(true);
});

app.factory('UserDataService', ['UserData',
  function(UserData) {
    var userData = null;
    return {
      userData: userData,
      setUp: function() {
        console.log('setup')
        this.userData = UserData.get();
      }
    };
  }
]);
app.factory('deviceInfoService', ['$window',
  function($window) {
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

  }
]);

app.filter('sanitizecodename', function() {
  return function(input) {
    if (!input) return "";

    input = input
      .replace(/^@*/g, '');
    return input;
  }
})
  .filter('normalizecodename', ['$filter',
    function($filter) {
      return function(input) {
        var legalcodename = "@" + $filter('sanitizecodename')(input);
        return legalcodename;
      };
    }
  ])
  .filter('sanitizelabel', function() {
    return function(input) {
      if (!input) return "";

      input = input
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/\W+/g, '')
        .replace(/^#*/g, '');
      return input;
    }
  })
  .filter('normalizelabel', ['$filter',
    function($filter) {
      return function(input) {
        var legallabel = "#" + $filter('sanitizelabel')(input);
        return legallabel;
      };
    }
  ]);