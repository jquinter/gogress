angular.module('goGress').config(function($mdIconProvider) {
  var iconDir = 'img/svg-sprite';
  $mdIconProvider
    .iconSet('action', iconDir + '/svg-sprite-action.svg', 24)
    .iconSet('content', iconDir + '/svg-sprite-content.svg', 24)
    .iconSet('maps', iconDir + '/svg-sprite-maps.svg', 24)
    .iconSet('ingress', 'img/svg-sprite-ingress.svg', 24)
    .defaultIconSet(iconDir + '/svg-sprite-navigation.svg', 24);
});
angular.module('goGress').config(function($authProvider, $mdThemingProvider, $stateProvider, $urlRouterProvider, $locationProvider, $resourceProvider) {
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
    .state('keys', {
      url: '/keys/',
      templateUrl: 'tmpl/key_list.html',
      controller: 'KeyListController',
      controllerAs: 'key'
    })

  $resourceProvider.defaults.stripTrailingSlashes = false;
  $locationProvider.html5Mode(true);
});