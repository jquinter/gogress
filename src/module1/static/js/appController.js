angular.module('goGress').controller('AppController', [
  '$rootScope',
  '$scope',
  '$mdDialog',
  '$mdSidenav',
  '$mdToast',
  '$log',
  '$auth',
  'AgentService',
  'LabelService',
  'UserData',
  'UserDataService',
  'screenSize',
  function($rootScope, $scope, $mdDialog, $mdSidenav, $mdToast, $log, $auth, AgentService, LabelService, UserData, UserDataService, screenSize) {
    $scope.saveFavourite = function(portal) {
      if (portal.id) {
        UserDataService.userData.$promise.then(function() {
          var favs = UserDataService.userData.favourites;
          if (portal.favourite) {
            var index = favs.indexOf(portal.id)
            if (index >= 0)
              favs.splice(index, 1);
          } else
            favs.push(portal.id);
          portal.favourite = !portal.favourite;
          return UserData.save(UserDataService.userData).$promise.then(function() {
            console.log('Favorito guardado con exito')
          });
        })
      }
    }
    $scope.loadSysConfigSettings = function() {
      UserDataService.userData.$promise.then(function() {
        loaded_config = UserDataService.userData.sys_config;
        if( Object.keys(loaded_config).length > 0 ){
          for (var key in loaded_config) {
            $scope.sys_config[key] = loaded_config[key];
          };
        }
      });
    }
    $scope.saveSysConfigSettings = function() {
      UserDataService.userData.sys_config = JSON.stringify({
        allow_sidebar_left_locked_open: $scope.sys_config.allow_sidebar_left_locked_open,
        allow_sidebar_right_locked_open: $scope.sys_config.allow_sidebar_right_locked_open,
        font: $scope.sys_config.font,
        theme: $scope.sys_config.theme,
        zoom_level: $scope.sys_config.zoom_level
      });
      return UserData.save(UserDataService.userData).$promise.then(function() {
        console.log('Settings para usuario guardado con exito')
      });
    }

    $scope.authenticating = false;
    $scope.sys_config = {};
    $scope.sys_config.font = "Coda"; //Roboto ???
    $scope.auth = $auth
    $scope.sys_config.allow_sidebar_left_locked_open = true;
    $scope.sys_config.allow_sidebar_right_locked_open = false;
    $scope.sys_config.fonts = ["Coda", "Roboto"];
    $scope.sys_config.theme = "green";
    $scope.sys_config.themes = ["green", "ingress"];
    $scope.sys_config.zoom_level = 14;
    $scope.sys_config.zoom_level_refs = [{
      zoom: 0,
      ref: "Mundo"
    }, {
      zoom: 9,
      ref: "Región"
    }, {
      zoom: 13,
      ref: "Ciudad"
    }, {
      zoom: 14,
      ref: "Comuna"
    }, {
      zoom: 18,
      ref: "Villa"
    }, {
      zoom: 20,
      ref: "Calle/Pasaje"
    }, {
      zoom: 21,
      ref: "OMG" 
    }]

    $scope.$watchCollection('sys_config', function(newValues, oldValues) {
      if ($auth.isAuthenticated()){
        $scope.saveSysConfigSettings();
      }
    });

    if ($auth.isAuthenticated()){
      UserDataService.setUp();
      $scope.loadSysConfigSettings();
    }

    $scope.showSettings= function(ev, settings) {
        $mdDialog.show({
          controller: DialogController,
          templateUrl: '/partials/settings-'+settings+'.html',
          targetEvent: ev,
          locals:{
            sys_config: $scope.sys_config
          },
          preserveScope: true
        })
        .then(function(answer) {
          console.log('You choose "' + answer + '".');
        }, function() {
          console.log('You cancelled the dialog.');
        });
    }
    function DialogController($scope, $mdDialog, sys_config) {
      $scope.sys_config = sys_config;
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

    /*
    Screen size measuring
    */

    /*
    // Caution: will overwrite!!!
    screenSize.rules = {
      retina: 'only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)',
      superJumbo: '(min-width: 2000px)',

    };
    */
    $scope.desktop = screenSize.is('md, lg');
    $scope.mobile = screenSize.is('xs, sm');
    $scope.desktop = screenSize.on('md, lg', function(match){
        $scope.desktop = match;
    });
    $scope.mobile = screenSize.on('xs, sm', function(match){
        $scope.mobile = match;
    });

    $scope.authenticate = function(provider) {
      console.log("autenticando");
      $scope.authenticating = true;
      $auth.authenticate(provider)
        .then(function() {}).finally(function(e) {
          $scope.authenticating = false;
          UserDataService.setUp();
          $scope.loadSysConfigSettings();
          console.log("listo!");
        }).catch(function(e) {
          $scope.openToast("error autenticando");
          $scope.authenticating = false;
        });
    }
    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle()
        .then(function() {
          $log.debug("toggle left is done");
        });
    };
    $scope.toggleRight = function() {
      $mdSidenav('right').toggle()
        .then(function() {
          $log.debug("toggle right is done");
        });
    };
    $scope.closeLeft = function() {
      target = "left";
      if ($mdSidenav(target).isLockedOpen()) {
        $log.debug("toogle " + target + " is locked open");
        var allow = "allow_sidebar_" + target + "_locked_open";
        $scope.sys_config[allow] = false;
      }
      $mdSidenav(target).close()
        .then(function() {
          $log.debug("toggle " + target + " has been closed");
        });
    };
    $scope.closeRight = function() {
      if ($mdSidenav('right').isLockedOpen()) {
        $log.debug("toogle right is locked open");
        $scope.sys_config.allow_sidebar_right_locked_open = false;
      }
      $mdSidenav('right').close()
        .then(function() {
          $log.debug("toggle right has been closed");
        });
    };
    $scope.querySearch = false;
    $scope.searching = false;
    $scope.onSearchKeyDown = function(event, text) {
      if (event.keyCode == 13) {
        var promise = $scope.querySearch(text);
        if (promise) {
          $scope.searching = true;
          promise["finally"](function() {
            $scope.searching = false;
          })
        }
      }
    }
    $scope.enableSearch = function(call) {
      $scope.querySearch = call;
    }
    $scope.disableSearch = function() {
      $scope.querySearch = false;
    }
    $scope.openToast = function(msg) {
      $mdToast.show(
        $mdToast.simple()
        .position("top right")
        .theme($scope.sys_config.theme)
        .content(msg)
        .hideDelay(4000)
      );
    };

    $scope.showPictures = function($event) {
      $mdDialog.show({
        targetEvent: $event,
        templateUrl: 'partials/image-dialog.tpl.html',
        controller: 'ImageViewerController',
        controllerAs: 'imgViewerVm',
        locals: {
          portal: this.portal
        }
      });
    }

    $scope.copyToClipboard = function(text) {
      window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    }

    $scope.getBoundsZoomLevel = function(bounds, mapDim) {
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

    $scope.querySearchAgentes = function(query) {
      return AgentService.agents.$promise.then(function(data) {
        return data.filter(createFilterFor('agent', query));
      })
    }
    $scope.querySearchLabels = function(query) {
      return LabelService.labels.$promise.then(function(data) {
        return data.filter(createFilterFor('label', query));
      })
    }
    /**
     * Create filter function for a query string
     */
    function createFilterFor(objectiveType, query) {
      var lowercaseQuery = angular.lowercase(query);

      if (objectiveType == 'agent') {
        return function filterFn(objective) {
          if (lowercaseQuery == "*") return true;
          return (objective.codeName.toLowerCase().indexOf(lowercaseQuery) === 0);
        };
      } else if (objectiveType == 'label') {
        return function filterFn(objective) {
          if (lowercaseQuery == "*") return true;
          return (objective.name.toLowerCase().indexOf(lowercaseQuery) === 0);
        };
      } else {
        return true;
      }

    }
  }
]);