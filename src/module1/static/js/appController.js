(function() {
  angular.module('goGress').controller('AppController', AppController);
  AppController.$inject = ['$scope', '$mdDialog', '$mdSidenav', '$mdToast', '$log', '$auth', 'AgentService', 'LabelService', 'UserData', 'UserDataService', '$state', 'UserService', '$q'];

  function AppController($scope, $mdDialog, $mdSidenav, $mdToast, $log, $auth, AgentService, LabelService, UserData, UserDataService, $state, UserService, $q) {
    $scope.state = $state;
    $scope.auth = $auth;
    $scope.authenticate = authenticate;
    $scope.openToast = openToast;
    $scope.backArrow = function() {
      $state.go('^.list');
    };
    if ($auth.isAuthenticated()) {
      $scope.setup = true;
      setUp();
    }else {
      $state.go('home')
    }

    $scope.sysConfig = {
      font: 'Coda',
      allowSidebarLeftLockedOpen: true,
      allowSidebarRightLockedOpen: false,
      fonts: ['Coda', 'Roboto'],
      theme: 'green',
      themes: ['green', 'ingress'],
      zoomLevel: 14,
      zoomLevelRefs: [{
        zoom: 0,
        ref: 'Mundo'
      }, {
        zoom: 9,
        ref: 'Región'
      }, {
        zoom: 13,
        ref: 'Ciudad'
      }, {
        zoom: 14,
        ref: 'Comuna'
      }, {
        zoom: 18,
        ref: 'Villa'
      }, {
        zoom: 20,
        ref: 'Calle/Pasaje'
      }, {
        zoom: 21,
        ref: 'OMG'
      }]
    };

    $scope.toggleSideNav = function() {
      $mdSidenav('left').toggle()
        .then(function() {
          $log.debug('toggle left is done');
        });
    };
    $scope.toggleRight = function() {
      $mdSidenav('right').toggle()
        .then(function() {
          $log.debug('toggle right is done');
        });
    };
    $scope.closeLeft = function() {
      var target = 'left';
      if ($mdSidenav(target).isLockedOpen()) {
        $log.debug('toogle ' + target + ' is locked open');
        var allow = 'allow_sidebar_' + target + '_locked_open';
        $scope.sysConfig[allow] = false;
      }
      $mdSidenav(target).close()
        .then(function() {
          $log.debug('toggle ' + target + ' has been closed');
        });
    };
    $scope.closeRight = function() {
      if ($mdSidenav('right').isLockedOpen()) {
        $log.debug('toogle right is locked open');
        $scope.sysConfig.allowSidebarRightLockedOpen = false;
      }
      $mdSidenav('right').close()
        .then(function() {
          $log.debug('toggle right has been closed');
        });
    };


    /* Search methods move to ... */
    $scope.querySearch = false;
    $scope.searching = false;
    $scope.onSearchKeyDown = function(event, text) {
      if (event.keyCode == 13) {
        var promise = $scope.querySearch(text);
        if (promise) {
          $scope.searching = true;
          promise['finally'](function() {
            $scope.searching = false;
          });
        }
      }
    };
    $scope.enableSearch = function(call) {
      $scope.querySearch = call;
    };
    $scope.disableSearch = function() {
      $scope.querySearch = false;
    };

    /*****/
    function setUp() {
      if (!$auth.getPayload().agentId) {
        $mdDialog.show({
            controller: function($scope, $mdDialog) {
              $scope.associate = function associate(codeName) {
                if (codeName) {
                  UserService.associateToAgent(codeName).then(function() {
                    $mdToast.show($mdToast.simple().content('Exito, deslogeandote....'));
                    $auth.logout();
                    $mdDialog.hide()
                  }).catch(function(response) {
                    $mdToast.show($mdToast.simple().content('Error al asociar: ' + response.data));
                    $auth.logout();
                  })
                } else {
                  $mdToast.show($mdToast.simple().content('codename no puede estar vacio'));
                }
              }
            },
            templateUrl: '/static/user/userSetupDialog.html',
            clickOutsideToClose: false,
            escapeToClose: false
          });
      } else {
        UserDataService.setUp();
        var promises = [UserDataService.userData.$promise];
        UserDataService.userData.$promise.then(function(data) {
          angular.extend($scope.sysConfig, data.sysConfig);
          $scope.$watchCollection('sysConfig', function(newValues, oldValues) {
            // Patch to save only when different values, (when refereneces change and values do not change this is triggered)
            if (newValues != oldValues) {
              console.log('saving config')
                //TODO: prevent double saving (when you change the config rapidly)
                //TODO: move to service
              UserDataService.userData.sysConfig = JSON.stringify({
                allowSidebarLeftLockedOpen: $scope.sysConfig.allowSidebarLeftLockedOpen,
                allowSidebarRightLockedOpen: $scope.sysConfig.allowSidebarRightLockedOpen,
                font: $scope.sysConfig.font,
                theme: $scope.sysConfig.theme,
                zoomLevel: $scope.sysConfig.zoomLevel
              });
              UserData.save(UserDataService.userData);
            }
          });
        });
        if (AgentService.agents) promises.push(AgentService.agents.$promise);
        $q.all(promises).catch(function(response) {
          if (response.status === 403) {
            $scope.openToast('Error en datos de sesion, deslogeando');
          }
          $scope.openToast('Error desconosido.., deslogeando');
          $auth.logout()
        }).finally(function() {
          $scope.setup = false;
        })
      }
    }

    function openToast(msg) {
      $mdToast.show(
        $mdToast.simple()
        .position('top right')
        .theme($scope.sysConfig.theme)
        .content(msg)
        .hideDelay(4000)
      );
    };

    function authenticate(provider) {
      $scope.setup = true;
      $auth.authenticate(provider).then(function() {
        $scope.openToast('Autenticado, cargando datos');
        setUp();
      }).catch(function(e) {
        $scope.openToast('error autenticando ' + e);
      }).finally(function() {
        $scope.setup = false;
      });
    };
  }
})();