(function() {
  angular.module('goGress').controller('AppController', AppController);
  AppController.$inject = ['$scope', '$mdDialog', '$mdSidenav', '$mdToast', '$log', '$auth', 'AgentService', 'LabelService', 'UserData', 'UserDataService', '$state', 'UserService', '$q'];

  function AppController($scope, $mdDialog, $mdSidenav, $mdToast, $log, $auth, AgentService, LabelService, UserData, UserDataService, $state, UserService, $q) {
    $scope.state = $state;
    $scope.auth = $auth;
    $scope.authenticate = authenticate;
    $scope.openToast = openToast;
    $scope.sections = [{
      title: 'Portales',
      items: [{
        title: 'Favoritos',
        state: 'portal.list.favourite',
        search: false
      }, {
        title: 'Todos',
        state: 'portal.list',
        search: true
      }, {
        title: 'Importar',
        state: 'portal.import'
      }]
    }, {
      title: 'Agentes',
      items: [{
        title: 'Favoritos',
        state: 'agent.list.favourite',
        search: false
      }, {
        title: 'Todos',
        state: 'agent',
        search: true
      }]
    }, {
      title: 'Llaves',
      items: [{
        title: 'Todos',
        state: 'key.list',
        search: false
      }]
    }, {
      title: 'Etiquetas',
      state: 'label_list',
      search: false
    }, {
      title: 'Operaciones',
      state: 'operaton.list',
      search: false
    }];
    $scope.backArrow = function() {
      $state.go('^.list');
    };
    if ($auth.isAuthenticated()) {
      $scope.setup = true;
      setUp();
    } else
      $state.go('home');


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
            $scope.openToast('Error en datos de sesion, deslogeando (GOGRESSAUTHERR)');
          } else {
            $scope.openToast('Error desconocido.., deslogeando');
          }
          $auth.logout()
        }).finally(function() {
          $scope.setup = false;
        })
      }
    }

    $scope.showPictures = function($event, portal) {
      $mdDialog.show({
        targetEvent: $event,
        templateUrl: 'partials/image-dialog.tpl.html',
        controller: 'ImageViewerController',
        controllerAs: 'imgViewerVm',
        locals: {
          imageMode: 'natural',
          portal: portal
        }
      });
    }

    $scope.copyToClipboard = function(text) {
      window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    }

    $scope.getWindowDimensions = function() {
      return {
        'height': $window.innerHeight,
        'width': $window.innerWidth
      };
    };

    $scope.getBoundsZoomLevel = function(bounds) {
      var screendata = $scope.getWindowDimensions();
      mapDim = screendata;

      var WORLD_DIM = {
        height: 256,
        width: 256
      };
      var ZOOM_MAX = 21;

      function latRad(lat) {
        var sin = Math.sin(lat * Math.PI / 180);
        var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
        return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
      }

      function zoom(mapPx, worldPx, fraction) {
        return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
      }

      var ne = bounds.getNorthEast();
      var sw = bounds.getSouthWest();

      var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

      var lngDiff = ne.lng() - sw.lng();
      var lngFraction = ((lngDiff < 0) ? (lngDiff + 360) : lngDiff) / 360;

      var latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
      var lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

      return Math.min(latZoom, lngZoom, ZOOM_MAX);
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