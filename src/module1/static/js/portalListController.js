angular.module('goGress').controller('PortalListController', [
  '$scope',
  '$window',
  'Portal',
  'AgentService',
  'LabelService',
  '$log',
  '$mdBottomSheet',
  '$q',
  '$timeout',
  '$routeParams',
  function($scope, $window, Portal, AgentService, LabelService, $log, $mdBottomSheet, $q, $timeout, $routeParams) {
    $scope.newlabel = {};
    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 15,
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

    $scope.searchPortal = function(labels) {
      $scope.loading = true;
      $scope.items = Portal.query({
        labels: labels
      })
      $scope.items.$promise["finally"](function() {
        $scope.loading = false;
      })
      $scope.labels = labels;
    }
    $scope.hidePortal = function() {
      $scope.viewPortal = false;
      $scope.portal = {};
    }
    $scope.setMarkers = function(portal) {
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
    }
    $scope.showPortal = function(portal) {
      $scope.setMarkers(portal);
      $scope.portal = portal;
      if (!$scope.portal.selectedIndex)
        $scope.portal.selectedIndex = 4;
      $scope.viewPortal = true;
    }
    $scope.showMap = function(portal) {
      $scope.setMarkers(portal);
      $scope.closeRight();
      $scope.viewPortal = false;
      $scope.viewMap = true;
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    }
    $scope.hideMap = function() {
      $scope.viewMap = false;
    }
    $scope.savePortal = function() {
      Portal.save($scope.portal);
    }
    $scope.addLabel = function(label) {
      if (!$scope.portal) return;

      if (!$scope.portal.labels) $scope.portal.labels = [];
      if ($scope.portal.labels.indexOf(label) == -1) {
        $scope.portal.labels.push(label);
      }
    }
    $scope.deleteLabel = function(label) {
      if (!$scope.portal) return;
      if (!$scope.portal.labels) $scope.portal.labels = [];

      var pos = $scope.portal.labels.indexOf(label);
      if (pos >= 0) {
        $scope.portal.labels.splice(pos, 1);
      }
    }
    $scope.addKey = function(portal, agentCodeName, amount) {
      if (!portal) return alert('oh oh esto no deberia pasar');
      if (!agentCodeName) return alert('agrega algo')
      if (!amount) return alert('mas de cero wn')
      AgentService.agents.$promise.then(function(data) {
        var found = data.filter(function(item) {
          return item.codeName.toLowerCase() == agentCodeName.toLowerCase();
        });
        if (found.length > 0) {
          var f = found[0];
          if (!portal.keys) portal.keys = [];
          for (var i=0; i<portal.keys.length; i++){
            if (portal.keys[i].agent.id == f.id)
              return alert('agente ya agregado')
          }
          portal.keys.push({
            agentId : f.id,
            agent: f,
            amount: amount
          })
        } else {
          alert('agente no encontrado')
        }
      })
    }
    $scope.deleteKey = function(portal, key) {
      if (!$scope.portal) return;
      if (!portal.keys) portal.keys = [];

      if (typeof(key) == 'object') {
        if (key.agentKey) {
          var pos = -1;
          //busacr elemento a ser borrado
          //debo buscar asi pues el orden del listado
          //de llaves en la interfaz esta filtrado
          for (var i = 0; i < portal.keys.length; i++) {
            if (portal.keys[i].agentKey == key.agentKey) {
              pos = i;
              break;
            }
          };
          if (pos >= 0) {
            portal.keys.splice(pos, 1);
          }
        }
      }
    }

    $scope.selected_portals_to_link = [];
    $scope.selected_portals_to_link_data = [];
    $scope.intel_pls_links = [];
    $scope.intel_pls = "";

    $scope.toggleLinkable = function(idx) {
      var pos = $scope.selected_portals_to_link.indexOf(idx.title);
      if (pos == -1) {
        console.log( $scope.selected_portals_to_link );
        if($scope.selected_portals_to_link.length >= 3){
          $scope.openToast("No puede elegir más de 3 portales para simular linkeo");
          return;
        }

        $scope.selected_portals_to_link.push(idx.title);
        $scope.selected_portals_to_link_data.push(idx);
      } else {
        $scope.selected_portals_to_link.splice(pos, 1);
        $scope.selected_portals_to_link_data.splice(pos, 1);
      }
      //regenerate intel_pls_links array
      $scope.intel_pls_links = [];
      for (var i = 0; i < $scope.selected_portals_to_link_data.length; i++) {
        p_start = $scope.selected_portals_to_link_data[i];
        for (var j = i + 1; j < $scope.selected_portals_to_link_data.length; j++) {
          p_end = $scope.selected_portals_to_link_data[j];

          link = p_start.lat / 1000000 + "," + p_start.lon / 1000000 + "," + p_end.lat / 1000000 + "," + p_end.lon / 1000000;
          $scope.intel_pls_links.push(link);
        };
      };
      $scope.intel_pls = $scope.intel_pls_links.join("_");
    }

    $scope.showPortalSecondaryActionsBottomSheet = function(item) {
      $mdBottomSheet.show({
        templateUrl: "partials/portal_list-secondary_actions_bottom_sheet.html",
        controller: ['$scope', '$mdBottomSheet',
          function($scope, $mdBottomSheet) {
            $scope.itemClick = function($label) {
              $mdBottomSheet.hide($label);
            };
          }
        ]
      }).then(function(response) {
        if (response == 'showPortal') {
          $scope.showPortal(item);
        } else if (response == 'map') {
          $scope.showMap(item);
        } else if (response == 'intel') {
          window.open("https://www.ingress.com/intel?z=13&pll=" + (item.lat / 1000000) + "," + (item.lon / 1000000) + "&pls=" + ($scope.intel_pls) + "");
        } else if (response == 'waze') {
          window.open("waze://?ll=" + item.lat / 1000000 + "," + item.lon / 1000000 + "&z=10&navigate=yes");
        } else if (response == 'toggleLink') {
          $scope.toggleLinkable(item);
        }
      });
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

    //inicializar
    if ($routeParams.label) {
      //llegamos por ruta habilitada para filtrar por etiquetas
      $scope.searchPortal($routeParams.label);
    } else {
      $scope.items = Portal.query();
      $scope.items.$promise.then(function(portals){
        //TODO: unpretty patch... fixit!!!
        AgentService.agents.$promise.then(function(agents){
          for (var i=0; i<portals.length; i++){
            var portal = portals[i];
            for (var j=0; j<portal.keys.length; j++){
              var key = portal.keys[j];
              for (var k=0; k<agents.length; k++){
                if (agents[k].id == key.agentId){
                  key.agent = agents[k];
                }
              }
            }
          }
        })
      })
      $scope.loading = true;
      $scope.items.$promise["finally"](function() {
        $scope.loading = false;
      })

    }

  }
]);