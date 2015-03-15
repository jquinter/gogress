(function() {
  angular.module('goGress').controller('PortalListController', PortalListController);
  PortalListController.$inject = ['$scope', '$filter', '$window', 'Agent', 'PortalFactory', 'AgentService', 'LabelService', '$log', '$mdBottomSheet', '$q', '$timeout', '$stateParams', '$location'];
  function PortalListController($scope, $filter, $window, Agent, Portal, AgentService, LabelService, $log, $mdBottomSheet, $q, $timeout, $stateParams, $location) {
    $scope.newlabel = {};
      /*$scope.saveFavourite = function(portal) {
        if (portal.id)
          UserDataService.userData.$promise.then(function() {
            var favs = UserDataService.userData.favourites;
            if (portal.favourite) {
              var index = favs.indexOf(portal.id);
              if (index >= 0) favs.splice(index, 1);
            } else favs.push(portal.id);

            portal.favourite = !portal.favourite;
            return UserData.save(UserDataService.userData).$promise.then(function() {
              console.log('Favorito guardado con exito');
            });
          });
      };*/
    $scope.copyToClipboard = function(text) {
      window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
    };


    $scope.showPictures = function($event) {
      $mdDialog.show({
        targetEvent: $event,
        templateUrl: 'partials/image-dialog.tpl.html',
        controller: 'ImageViewerController',
        controllerAs: 'imgViewerVm',
        locals: {
          imageMode: 'natural',
          portal: this.item ? this.item : this.portal
        }
      });
    };
    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: $scope.sysConfig.zoomLevel,
      events: {
        tilesloaded: function(map) {
          $scope.$apply(function() {
            console.log(map);
            $log.info('this is the map instance', map);
          });
        }
      }
    };
    $scope.markers = [];
    $scope.viewPortal = false;
    //TODO: desactivate on route change
    $scope.enableSearch(function(query) {
      if (query) {
        var labels = [];
        var newquery = query.replace(/#(\w+)/g, function() {
          labels.push(arguments[1]);
          return '';
        });
        var gaeQuery = newquery.trim();
        if (labels.length > 0)
          gaeQuery += ' ' + labels.map(function(a) {
            return 'Label:' + a;
          }).join(' AND ');
        $scope.items = Portal.query({
          favorites: $scope.favorites ? 'true' : null,
          query: gaeQuery
        });
        return $scope.items.$promise;
      }
    });

    $scope.searchPortalById = function(portalId) {
      $scope.loading = true;
      $scope.items = Portal.query({
        id: portalId
      });
      $scope.items.$promise.finally(function() {
        $scope.loading = false;
        $scope.showPortal($scope.items[0]);
      });
    };
    $scope.searchPortal = function(labels) {
      $scope.loading = true;
      $scope.items = Portal.query({
        labels: labels
      });
      $scope.items.$promise.finally(function() {
        $scope.loading = false;
      });
      $scope.labels = labels;
    };
    $scope.hidePortal = function() {
      $scope.viewPortal = false;
      $scope.portal = {};
    };
    $scope.setMarkers = function(portal) {
      $scope.map.zoom = $scope.sysConfig.zoomLevel;
      $scope.map.center.latitude = portal.lat / 1000000;
      $scope.map.center.longitude = portal.lon / 1000000;
      $scope.markers = [{
        id: portal.id,
        latitude: $scope.map.center.latitude,
        longitude: $scope.map.center.longitude,
        title: portal.title,
        show: true
      }];
      $scope.marker = {
        id: portal.id,
        coords: {
          latitude: $scope.map.center.latitude,
          longitude: $scope.map.center.longitude
        },
        options: {
          labelContent: portal.title
        },
        show: true
      };

      $scope.windowOptions = {
        content: portal.title,
        visible: true
      };
    };
    $scope.showPortal = function(portal) {
      $scope.setMarkers(portal);
      $scope.portal = portal;

      $scope.portal.ingressUrl = 'https://www.ingress.com/intel?z=' + $scope.sysConfig.zoomLevel + '&ll=' + (portal.lat / 1000000) + ',' + (portal.lon / 1000000) + ($scope.intelPls ? '&pls=' + $scope.intelPls : '');

      $scope.portal.wazeUrl = 'http://waze.to/?ll=' + (portal.lat / 1000000) + ',' + (portal.lon / 1000000) + '&z=' + $scope.sysConfig.zoomLevel + '&navigate=yes';

      $scope.portal.gmapsUrl = 'https://www.google.com/maps/@' + (portal.lat / 1000000) + ',' + (portal.lon / 1000000) + ',' + $scope.sysConfig.zoomLevel + 'z' + '/data=!3m1!4b1!4m2!3m1!1s0x0:0x0';

      if (!$scope.portal.selectedIndex)
        $scope.portal.selectedIndex = 4;
      $scope.viewPortal = true;
    };
    $scope.showMap = function(portal) {
      $scope.setMarkers(portal);
      $scope.closeRight();
      $scope.viewPortal = false;
      $scope.viewMap = true;
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    };
    $scope.hideMap = function() {
      $scope.viewMap = false;
    };
    $scope.savePortal = function() {
      var guardar;
      guardar = Portal.save($scope.portal);
      guardar.$promise.finally(function() {});
      guardar.$promise.then(function() {
        $scope.openToast('El portal se ha guardado.');
        return false;
      });
      guardar.$promise.catch(function(error) {
        var msje = 'No se puede guardar el portal';

        if (error.status === 403)
          msje += ': parece un problema de permisos. Intente saliendo y entrando nuevamente con su cuenta.';
        else
          msje += ' [' + error.data + ']';

        $scope.openToast(msje);
        return false;
      });
    };
    $scope.addLabel = function(label) {
      console.log(this);
      if (!$scope.portal) return;

      var cleanedLabel = $filter('sanitizelabel')(label);

      if (!$scope.portal.labels) $scope.portal.labels = [];
      if ($scope.portal.labels.indexOf(cleanedLabel) === -1)
        $scope.portal.labels.push(cleanedLabel);
    };
    $scope.deleteLabel = function(label) {
      if (!$scope.portal) return;
      if (!$scope.portal.labels) $scope.portal.labels = [];

      var pos = $scope.portal.labels.indexOf(label);
      if (pos >= 0)
        $scope.portal.labels.splice(pos, 1);
    };
    $scope.addKey = function(portal, agentData, amount) {
      var posibleNuevaAdicion = false;

      var agenteBuscado = this.agentcodenameQuery;
      if (!portal) {
        $scope.openToast('No hay portal seleccionado al cual agregar llaves. Esto no debería ocurrir.');
        return false;
      }
      if (!agenteBuscado) {
        $scope.openToast('No se ha ingresado agente. ¿Quién tiene estas llaves?');
        return false;
      }
      if (!amount) {
        $scope.openToast('No se ha ingresado cantidad de llaves. ¿Cuántas llaves tiene el agente ' + agenteBuscado + '?');
        return false;
      }

      if (agentData) {
        agentCodeName = agentData.codeName;
        if (agentCodeName.toLowerCase() === agenteBuscado.toLowerCase()) {
          /*
          se busco un agente (escrito segun 'agenteBuscado')
          y se acepto la sugerencia del autocomplete
          */
          return $scope.addKeysToAgent(agentData, portal, amount);
        } else {
          // console.log('Vienen datos de agente y texto buscado...');
          // console.log( agentCodeName, agentData, agenteBuscado);
          // return alert('Calce no se ajusta a texto buscado');
          posibleNuevaAdicion = true;
        }
      } else
      /*
      no viene sugerencia seleccionada desde el auto-complete:
      revisar si viene texto. Si es así, entonces quiere agregar
      a un agente en forma directa
      */
      if (agenteBuscado)
      //emitir warning:
        posibleNuevaAdicion = true;

      if (posibleNuevaAdicion) {
        var pregunta = confirm('Ud quiere agregar llaves para el agente ' + agenteBuscado + '... Vamos a tener que registrar al nuevo agente');
        if (pregunta)
          AgentService.agents.$promise.then(function(data) {
            var found = data.filter(function(item) {
              return item.codeName.toLowerCase() === agenteBuscado.toLowerCase();
            });
            if (found.length > 0)
            //ya estaba, no hay que agregarlo, usar sus datos no mas
              return $scope.addKeysToAgent(found[0], portal, amount);
            else {
              var newagent = Agent.save({
                codeName: agenteBuscado
              });
              newagent.$promise.then(function(newagentdata) {
                AgentService.agents.push(newagentdata);
                $scope.querySearchAgentes('*');
                return $scope.addKeysToAgent(newagentdata, portal, amount);
              }).catch(function() {
                $scope.openToast('Hubo un error al intentar agregar el agente ' + agenteBuscado);
                return false;
              });
            }
          });
        else {
          //no, no estaba, hay que crearlo: emitir warning
          $scope.openToast('Vuelva a seleccionar desde el listado');
          return false;
        }
      }
    };

    $scope.addKeysToAgent = function(agent, portal, amount) {
      if (!agent) {
        $scope.openToast('No vienen datos de agente (function addKeysToAgent)');
        return false;
      } else {
        if (!portal.keys) portal.keys = [];
        for (var i = 0; i < portal.keys.length; i++)
          if (portal.keys[i].agentId === agent.id) {
            $scope.openToast('El agente ya aparece en el listado de llaves... error!');
            $scope.openToast('Error agregando las ' + amount + ' llaves del agente ' + agent.codeName);
            return false;
          }

        portal.keys.push({
          agentId: agent.id,
          agent: agent,
          amount: amount
        });

        $scope.openToast(amount + ' llaves agregadas del agente ' + agent.codeName);
        return true;
      }
    };

    $scope.deleteKey = function(portal, key) {
      if (!$scope.portal) return;
      if (!portal.keys) portal.keys = [];

      if (typeof key === 'object')
        if (key.agentId) {
          var pos = -1;
          //busacr elemento a ser borrado
          //debo buscar asi pues el orden del listado
          //de llaves en la interfaz esta filtrado
          for (var i = 0; i < portal.keys.length; i++)
            if (portal.keys[i].agentId === key.agentId) {
              pos = i;
              break;
            }

          if (pos >= 0) portal.keys.splice(pos, 1);
        }
    };

    $scope.resetPortalsToLink = function() {
      $scope.selectedPortalsToLink = [];
      $scope.selectedPortalsToLinkData = [];
      $scope.intelPlsLinks = [];
      $scope.intelPls = '';
      $scope.ingressCentroidUrl = '';
    };
    $scope.resetPortalsToLink();

    $scope.toggleLinkable = function(idx) {
      var pos = $scope.selectedPortalsToLink.indexOf(idx.title);
      if (pos === -1) {
        console.log($scope.selectedPortalsToLink);
        if ($scope.selectedPortalsToLink.length >= 3) {
          $scope.openToast('No puede elegir más de 3 portales para simular linkeo');
          return;
        }

        $scope.selectedPortalsToLink.push(idx.title);
        $scope.selectedPortalsToLinkData.push(idx);
      } else {
        $scope.selectedPortalsToLink.splice(pos, 1);
        $scope.selectedPortalsToLinkData.splice(pos, 1);
      }
      //regenerate intelPlsLinks array
      $scope.intelPlsLinks = [];
      $scope.intelPlsCentroid = {};
      $scope.intelPlsCentroid.lat = 0;
      $scope.intelPlsCentroid.lon = 0;
      $scope.ingressCentroidUrl = '';
      $scope.gmapPoints = [];

      for (var i = 0; i < $scope.selectedPortalsToLinkData.length; i++) {
        var startingPoint = $scope.selectedPortalsToLinkData[i];
        $scope.gmapPoints.push(
          new google.maps.LatLng(startingPoint.lat / 1000000, startingPoint.lon / 1000000)
        );

        for (var j = i + 1; j < $scope.selectedPortalsToLinkData.length; j++) {
          var endingPoint = $scope.selectedPortalsToLinkData[j];

          var link = startingPoint.lat / 1000000 + ',' + startingPoint.lon / 1000000 + ',' + endingPoint.lat / 1000000 + ',' + endingPoint.lon / 1000000;
          $scope.intelPlsLinks.push(link);
        }
        $scope.intelPlsCentroid.lat += startingPoint.lat;
        $scope.intelPlsCentroid.lon += startingPoint.lon;
      }
      $scope.intelPlsCentroid.lat = $scope.intelPlsCentroid.lat / i;
      $scope.intelPlsCentroid.lon = $scope.intelPlsCentroid.lon / i;

      $scope.gmapCf = new google.maps.Polygon({
        path: $scope.gmapPoints,
        strokeColor: '#02b902',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0b560f',
        fillOpacity: 0.4
      });

      //initialize the bounds
      var bounds = new google.maps.LatLngBounds();

      //iterate over the points in the path
      $scope.gmapCf.getPath().getArray().forEach(function(point) {
        //extend the bounds
        bounds.extend(point);
      });

      //now use the bounds
      var correctedZoom = $scope.getBoundsZoomLevel(bounds);

      if ($scope.intelPlsLinks.length > 0) {
        $scope.intelPls = $scope.intelPlsLinks.join('_');

        $scope.ingressCentroidUrl = 'https://www.ingress.com/intel?z=' + correctedZoom + '&ll=' + ($scope.intelPlsCentroid.lat / 1000000) + ',' + ($scope.intelPlsCentroid.lon / 1000000) + ($scope.intelPls ? '&pls=' + $scope.intelPls : '');
      }
    };

    $scope.showPortalSecondaryActionsBottomSheet = function(item) {
      $mdBottomSheet.show({
        templateUrl: '/static/portal/portal_list-secondary_actions_bottom_sheet.html',
        controller: ['$scope', '$mdBottomSheet',
          function($scope, $mdBottomSheet) {
            $scope.itemClick = function($label) {
              $mdBottomSheet.hide($label);
            };
          }
        ]
      }).then(function(response) {
        if (response === 'showPortal') {
          $scope.showPortal(item);
          $scope.toggleRight();
        } else if (response === 'showImage') {
          $scope.showPortal(item);
          $scope.showPictures();
        } else if (response === 'map') {
          $scope.showMap(item);
        } else if (response === 'intel') {
          window.open('https://www.ingress.com/intel?z=' + $scope.sysConfig.zoomLevel + '&ll=' + (item.lat / 1000000) + ',' + (item.lon / 1000000) + '&pls=' + ($scope.intelPls) + '');
        } else if (response === 'waze') {
          window.open('waze://?ll=' + item.lat / 1000000 + ',' + item.lon / 1000000 + '&z=' + $scope.sysConfig.zoomLevel + '&navigate=yes');
        } else
        if (response === 'toggleLink') {
          $scope.toggleLinkable(item);
        }
      });
    };

    $scope.querySearchAgentes = function(query) {
      return AgentService.agents.$promise.then(function(data) {
        return data.filter(createFilterFor('agent', query));
      });
    };
    $scope.querySearchLabels = function(query) {
      return LabelService.labels.$promise.then(function(data) {
        return data.filter(createFilterFor('label', query));
      });
    };
    /**
     * Create filter function for a query string
     */
    function createFilterFor(objectiveType, query) {
      var lowercaseQuery = angular.lowercase(query);

      if (objectiveType === 'agent')
        return function filterFn(objective) {
          if (lowercaseQuery === '*') return true;
          return (objective.codeName.toLowerCase().indexOf(lowercaseQuery) === 0);
        };
      else if (objectiveType === 'label')
        return function filterFn(objective) {
          if (lowercaseQuery === '*') return true;
          return (objective.name.toLowerCase().indexOf(lowercaseQuery) === 0);
        };
      else
        return true;
    }

    $scope.getAgentCodename = function(agentId) {
      return AgentService.getById(agentId);
    };

    //vigilar
    $scope.$watchCollection('portal.keys', function(newValues, oldValues) {
      if (oldValues && newValues && newValues.length !== oldValues.length)
        console.log('LLaves del portal han cambiado');
      if (!oldValues && newValues)
        console.log('carga inicial, nada que hacer!');
      if (oldValues && oldValues.length === 0 && newValues)
        console.log('Se han agregado llaves al portal');
      if ((!newValues || newValues.length === 0) && oldValues)
        console.log('Portal se ha quedado sin llaves');
    });

    $scope.favorites = false;
    if ($location.search() && $location.search().favorites === 'true')
      $scope.favorites = true;

    $scope.ShowMeAllPortals = function() {
      if ($scope.favorites)
        $location.search('favorites', 'false');
    };

    if ($stateParams.id) {
      //llegamos por ruta habilitada para filtrar por etiquetas
      $scope.searchPortalById($stateParams.id);
    } else if ($stateParams.label) {
      //llegamos por ruta habilitada para filtrar por etiquetas
      $scope.searchPortal($stateParams.label);
    } else {
      $scope.items = Portal.query({
        favorites: $scope.favorites ? 'true' : null
      });
      $scope.loading = true;
      $scope.items.$promise.then(function(portals) {
        $scope.loading = false;
      });

      $scope.viewPortal = false;
      $scope.loading = true;
      $scope.items.$promise.finally(function() {
        $scope.loading = false;
      });
    }

    $scope.loadMore = function() {
      Portal.query({
        cursor: Portal.$getCursor()
      }).$promise.then(function(data) {
        Array.prototype.push.apply($scope.items, data);
      });
    };
  }
})();