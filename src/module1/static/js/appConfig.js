angular.module('goGress').run(function($rootScope, $location, $state, $auth) {
  $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
    console.log('verificando login')
    if (toState.name === 'home') {
      return;
    }
    if (!$auth.isAuthenticated()) {
      e.preventDefault();
      $state.go('home');
    }
  });
});

angular.module('goGress').config(function($mdIconProvider) {
  var iconDir = 'img/svg-sprite';
  $mdIconProvider
    .iconSet('action', iconDir + '/svg-sprite-action.svg', 24)
    .iconSet('content', iconDir + '/svg-sprite-content.svg', 24)
    .iconSet('maps', iconDir + '/svg-sprite-maps.svg', 24)
    .iconSet('image', iconDir + '/svg-sprite-image.svg', 24)
    .iconSet('ingress', 'img/svg-sprite-ingress.svg', 24)
    .defaultIconSet(iconDir + '/svg-sprite-navigation.svg', 24);
});
angular.module('goGress').config(function($authProvider, $mdThemingProvider, $stateProvider, $urlRouterProvider, $locationProvider, $resourceProvider) {
  $authProvider.google({
    clientId: '164620448986-olal315lm7t73p7qgp47isa5jl31le8r.apps.googleusercontent.com'
  });
  $mdThemingProvider.theme('green')
    .primaryPalette('teal')
    .accentPalette('light-green');

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
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state({
      name: 'home',
      url: '/',
      templateUrl: 'tmpl/nelson.html'
    })
    .state('portal', {
      url: '/portals/',
      abstract: true,
      templateUrl: '/static/portal/portal_root.html',
      controller: 'PortalRootController',
      //reloadOnSearch: true,
      title: 'Portales'
    })
    .state('portal.list', {
      url: '',
      templateUrl: '/static/portal/portal_list.html',
      controller: 'PortalListController',
      title: 'Portales'
    })
    .state('portal.search', {
      url: '/search/',
      templateUrl: '/static/portal/portal_list.html',
      controller: 'PortalListController',
      //reloadOnSearch: true,
      title: 'Busqueda de portales'
    })
    .state('portal.import', {
      url: 'import',
      templateUrl: 'static/portal/portal_import.html',
      controller: 'PortalController',
      title: 'Importación de Portales'
    })
    .state('portal.add', {
      url: '^/portals/add',
      templateUrl: 'static/portal/portal_edit.html',
      controller: 'PortalController',
      title: 'Nuevo portal'
    })
    .state('portal.list.label', {
      url: '/search/label/:label',
      templateUrl: 'static/portal/portal_list.html',
      controller: 'PortalListController',
      reloadOnSearch: true
    })
    .state('portal.view', {
      url: ':id',
      templateUrl: 'static/portal/portal-view.html',
      controller: 'PortalViewController'
    })
    .state('portal.edit', {
      url: ':id/edit',
      templateUrl: 'static/portal/portal_edit.html',
      controller: 'PortalEditController'
    })
    .state('agent', {
      url: '/agents/',
      templateUrl: 'static/agent/agent_list.html',
      controller: 'AgentListController',
      title: 'Agentes'
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
    .state('label_list', {
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
      templateUrl: '/static/settings/settings.html',
      controller: 'SettingsController'
    })
    .state('key', {
      url: '/keys/',
      abstract: true,
      templateUrl: '/static/key/key_main.html',
      controller: 'KeyListController',
      controllerAs: 'key'
    })
    .state('key.list', {
      url: '',
      templateUrl: '/static/key/key_list.html',
      title: 'Llaves'
    })
    .state('key.detail', {
      url: ':keyId/',
      templateUrl: '/static/key/key_detail.html',
      controller: 'KeyController',
      controllerAs: 'key',
      child: true,
      title: 'Llave'
    });

  $resourceProvider.defaults.stripTrailingSlashes = false;
  $locationProvider.html5Mode(true);
});