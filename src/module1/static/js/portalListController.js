angular.module('goGress').controller('PortalListController', [
  '$scope', '$filter', '$window', 'Agent', 'Portal', 'AgentService', '$log', '$mdBottomSheet', '$q', '$timeout', '$routeParams',
  function($scope, $filter, $window, Agent, Portal, AgentService, $log, $mdBottomSheet, $q, $timeout, $routeParams) {
    $scope.newlabel = {};
    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: $scope.sys_config.zoom_level,
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
        contieneLabels = query.indexOf("#");
        if (contieneLabels >= 0) {
          //hay que separar la consultas, por #, generar un arreglo
          labels = query.split("#");
          labels.shift(); //el elemento 0 es el inicio de la query
          $log.debug(labels);
        }
        $scope.items = Portal.query({
          title: query
        })
        return $scope.items.$promise;
      }
    })

    $scope.searchPortalById = function(portalId) {
      $scope.loading = true;
      $scope.items = Portal.query({
        id: portalId
      });
      $scope.items.$promise["finally"](function() {
        $scope.loading = false;
      })
    }
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
      $scope.map.zoom = $scope.sys_config.zoom_level;
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

      $scope.portal.ingress_url = 'https://www.ingress.com/intel?z=' + $scope.sys_config.zoom_level + '&ll=' + (portal.lat / 1000000) + ',' + (portal.lon / 1000000) + ($scope.intel_pls ? '&pls=' + $scope.intel_pls : '');

      $scope.portal.waze_url = 'waze://?ll=' + (portal.lat / 1000000) + ',' + (portal.lon / 1000000) + '&z=' + $scope.sys_config.zoom_level + '&navigate=yes';

      $scope.portal.gmaps_url = 'https://www.google.com/maps/@' + (portal.lat / 1000000) + ',' + (portal.lon / 1000000) + ',' + $scope.sys_config.zoom_level + 'z' + '/data=!3m1!4b1!4m2!3m1!1s0x0:0x0';

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
      guardar = Portal.save($scope.portal);
      guardar.$promise["finally"](function() {});
      guardar.$promise["then"](function() {
        $scope.openToast("El portal se ha guardado.");
        return false;
      })
      guardar.$promise["catch"](function(error) {
        var msje = "No se puede guardar el portal";
        if (error.status == 403) {
          msje += ": parece un problema de permisos. Intente saliendo y entrando nuevamente con su cuenta.";
        } else {
          msje += " [" + error.data + "]";

        }
        $scope.openToast(msje);
        return false;
      })
    }
    $scope.addLabel = function(label) {
      if (!$scope.portal) return;

      clean_label = $filter('sanitizelabel')(label);

      if (!$scope.portal.labels) $scope.portal.labels = [];
      if ($scope.portal.labels.indexOf(clean_label) == -1) {
        $scope.portal.labels.push(clean_label);
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
    $scope.addKey = function(portal, agentData, amount) {
      posible_nueva_adicion = false;

      agenteBuscado = this.agentcodenameQuery;
      if (!portal) {
        $scope.openToast("No hay portal seleccionado al cual agregar llaves. Esto no debería ocurrir.");
        return false;
      }
      if (!agenteBuscado) {
        $scope.openToast("No se ha ingresado agente. ¿Quién tiene estas llaves?");
        return false;
      }
      if (!amount) {
        $scope.openToast("No se ha ingresado cantidad de llaves. ¿Cuántas llaves tiene el agente " + agenteBuscado + "?");
        return false;
      }

      if (agentData) {
        agentCodeName = agentData.codeName;
        if (agentCodeName.toLowerCase() == agenteBuscado.toLowerCase()) {
          /*
          se busco un agente (escrito segun "agenteBuscado")
          y se acepto la sugerencia del autocomplete
          */
          return $scope.addKeysToAgent(agentData, portal, amount);
        } else {
          // console.log("Vienen datos de agente y texto buscado...");
          // console.log( agentCodeName, agentData, agenteBuscado);
          // return alert("Calce no se ajusta a texto buscado");
          posible_nueva_adicion = true;
        }
      } else {
        /*
        no viene sugerencia seleccionada desde el auto-complete:
        revisar si viene texto. Si es así, entonces quiere agregar
        a un agente en forma directa
        */
        if (agenteBuscado) {
          //emitir warning:
          posible_nueva_adicion = true;
        }
      }

      if (posible_nueva_adicion) {
        pregunta = confirm("Ud quiere agregar llaves para el agente " + agenteBuscado + "... Vamos a tener que registrar al nuevo agente");
        if (pregunta) {
          AgentService.agents.$promise.then(function(data) {
            var found = data.filter(function(item) {
              return item.codeName.toLowerCase() == agenteBuscado.toLowerCase();
            });
            if (found.length > 0) {
              //ya estaba, no hay que agregarlo, usar sus datos no mas
              return $scope.addKeysToAgent(found[0], portal, amount);
            } else {
              newagent = Agent.save({
                codeName: agenteBuscado
              });
              newagent.$promise.then(function(data) {
                AgentService.agents.push(data);
                $scope.querySearchAgentes("*");
                return $scope.addKeysToAgent(data, portal, amount);
              }).catch(function() {
                $scope.openToast("Hubo un error al intentar agregar el agente " + agenteBuscado);
                return false;
              });
            }
          });
        } else {
          //no, no estaba, hay que crearlo: emitir warning
          $scope.openToast("Vuelva a seleccionar desde el listado");
          return false;
        }
      }
    }

    $scope.addKeysToAgent = function(agent, portal, amount) {
      if (!agent) {
        $scope.openToast("No vienen datos de agente (function addKeysToAgent)");
        return false;
      } else {
        if (!portal.keys) portal.keys = [];
        for (var i = 0; i < portal.keys.length; i++) {
          if (portal.keys[i].agent.id == agent.id) {
            $scope.openToast("El agente ya aparece en el listado de llaves... error!");
            $scope.openToast("Error agregando las " + amount + " llaves del agente " + agent.codeName);
            return false;
          }
        }
        portal.keys.push({
          agentId: agent.id,
          agent: agent,
          amount: amount
        });

        $scope.openToast(amount + " llaves agregadas del agente " + agent.codeName);
        return true;
      }
    }

    $scope.deleteKey = function(portal, key) {
      if (!$scope.portal) return;
      if (!portal.keys) portal.keys = [];

      if (typeof(key) == 'object') {
        if (key.agentId) {
          var pos = -1;
          //busacr elemento a ser borrado
          //debo buscar asi pues el orden del listado
          //de llaves en la interfaz esta filtrado
          for (var i = 0; i < portal.keys.length; i++) {
            if (portal.keys[i].agentId == key.agentId) {
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
        console.log($scope.selected_portals_to_link);
        if ($scope.selected_portals_to_link.length >= 3) {
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
      $scope.intel_pls_centroid = {};
      $scope.intel_pls_centroid.lat = 0;
      $scope.intel_pls_centroid.lon = 0;
      $scope.ingress_centroid_url = '';
      $scope.gmap_points = [];

      for (var i = 0; i < $scope.selected_portals_to_link_data.length; i++) {
        p_start = $scope.selected_portals_to_link_data[i];
        gmap_start = new google.maps.LatLng(p_start.lat / 1000000, p_start.lon / 1000000);
        $scope.gmap_points.push(gmap_start);

        for (var j = i + 1; j < $scope.selected_portals_to_link_data.length; j++) {
          p_end = $scope.selected_portals_to_link_data[j];

          link = p_start.lat / 1000000 + "," + p_start.lon / 1000000 + "," + p_end.lat / 1000000 + "," + p_end.lon / 1000000;
          $scope.intel_pls_links.push(link);
        };
        $scope.intel_pls_centroid.lat += p_start.lat;
        $scope.intel_pls_centroid.lon += p_start.lon;
      };
      $scope.intel_pls_centroid.lat = $scope.intel_pls_centroid.lat / i;
      $scope.intel_pls_centroid.lon = $scope.intel_pls_centroid.lon / i;

      $scope.gmap_cf = new google.maps.Polygon({
        path: $scope.gmap_points,
        strokeColor: "#02b902",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0b560f",
        fillOpacity: 0.4
      });

      //initialize the bounds
      var bounds = new google.maps.LatLngBounds();

      //iterate over the points in the path
      $scope.gmap_cf.getPath().getArray().forEach(function(point) {
        //extend the bounds
        bounds.extend(point);
      });

      //now use the bounds
      dimensions = {
        height: 400,
        width: 400
      };
      correct_zoom = $scope.getBoundsZoomLevel(bounds, dimensions)

      if ($scope.intel_pls_links.length > 0) {
        $scope.intel_pls = $scope.intel_pls_links.join("_");

        $scope.ingress_centroid_url = 'https://www.ingress.com/intel?z=' + correct_zoom + '&ll=' + ($scope.intel_pls_centroid.lat / 1000000) + ',' + ($scope.intel_pls_centroid.lon / 1000000) + ($scope.intel_pls ? '&pls=' + $scope.intel_pls : '');
      }
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
          $scope.toggleRight();
        } else if (response == 'showImage') {
          $scope.showPortal(item);
          $scope.showPictures();
        } else if (response == 'map') {
          $scope.showMap(item);
        } else if (response == 'intel') {
          window.open("https://www.ingress.com/intel?z=" + $scope.sys_config.zoom_level + "&ll=" + (item.lat / 1000000) + "," + (item.lon / 1000000) + "&pls=" + ($scope.intel_pls) + "");
        } else if (response == 'waze') {
          window.open("waze://?ll=" + item.lat / 1000000 + "," + item.lon / 1000000 + "&z=" + $scope.sys_config.zoom_level + "&navigate=yes");
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
    $scope.getAgentCodename = function(agentId) {
      return AgentService.getById(agentId);
    }

    //vigilar
    $scope.$watchCollection('portal.keys', function(newValues, oldValues) {
      if (oldValues && newValues && newValues.length != oldValues.length) {
        console.log("LLaves del portal han cambiado");
      }
      if (!oldValues && newValues) {
        console.log("carga inicial, nada que hacer!");
      }
      if ( oldValues && oldValues.length == 0 && newValues) {
        console.log("Se han agregado llaves al portal");
      }
      if ((!newValues ||  newValues.length == 0) && oldValues) {
        console.log("Portal se ha quedado sin llaves");
      }

    });

    //inicializar
    $scope.agents = Agent.query();

    if ($routeParams.id) {
      //llegamos por ruta habilitada para filtrar por etiquetas
      $scope.searchPortalById($routeParams.id);
    } else if ($routeParams.label) {
      //llegamos por ruta habilitada para filtrar por etiquetas
      $scope.searchPortal($routeParams.label);
    } else {
      $scope.items = Portal.query();
      $scope.items.$promise.then(function(portals) {})
      $scope.loading = true;
      $scope.items.$promise["finally"](function() {
        $scope.loading = false;
      })
    }
    $scope.loadMore = function() {
      Portal.query({
        cursor: Portal.$getCursor()
      }).$promise.then(function(data) {
        Array.prototype.push.apply($scope.items, data)
      })
    }
  }
]).filter('agentCodeNameFromId', [

  function() {
    return function(agentId, agents) {
      if (!agents) return ""
      var found = agents.filter(function(item) {
        return item.id == agentId;
      });
      if (found.length > 0) {
        return found[0].codeName;
      } else {
        return "";
      }
    };
  }
]);