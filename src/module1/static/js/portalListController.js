angular.module('goGress').controller('PortalListController', [
  '$scope',
  '$window',
  'Portal',
  'AgentService',
  '$log',
  '$mdBottomSheet',
  '$q',
  '$timeout',
  function($scope, $window, Portal, AgentService, $log, $mdBottomSheet, $q, $timeout) {
    $scope.newlabel = "";
    $scope.map = {
      center: {
        latitude: 45,
        longitude: -73
      },
      zoom: 15
    };
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
    }
    $scope.showPortal = function(portal) {
      $scope.viewPortal = true;
      $scope.portal = portal;
    }
    $scope.showMap = function(portal) {
      $scope.map.center.latitude = portal.lat / 1000000;
      $scope.map.center.longitude = portal.lon / 1000000;
      $scope.markers = [{
        id: 1,
        latitude: $scope.map.center.latitude,
        longitude: $scope.map.center.longitude,
        title: portal.title
      }];
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
      if (!$scope.portal.labels) $scope.portal.labels = [];
      if ($scope.portal.labels.indexOf(label) == -1) {
        $scope.portal.labels.push(label);
      }
    }
    $scope.addKey = function(portal, key) {
      if (!portal.keys) portal.keys = [];
      if (typeof(key) == 'object'){
        key.agentKey = key.agent.codeName;
        portal.keys.push(key)
      }
      else if ((typeof(key) == 'string'))
        portal.keys.push(key)
    }

    $scope.selected_portals_to_link = [];
    $scope.selected_portals_to_link_data = [];
    $scope.intel_pls_links = [];
    $scope.intel_pls = "";

    $scope.toggleLinkable = function(idx) {
      var pos = $scope.selected_portals_to_link.indexOf(idx.title);
      if (pos == -1) {
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
        controller: ['$scope', '$mdBottomSheet', function($scope, $mdBottomSheet) {
          $scope.itemClick = function($label) {
            $mdBottomSheet.hide($label);
          };
        }]
      }).then(function(response) {
        if (response == 'showPortal') {
          $scope.showPortal(item);
        } else if (response == 'map') {
          $scope.showMap(item);
        } else if (response == 'intel') {
          window.open("https://www.ingress.com/intel?z=13&pll=" + (item.lat / 1000000) + "," + (item.lon / 1000000) + "&pls=" + ($scope.intel_pls) + "");
        } else if (response == 'toggleLink') {
          $scope.toggleLinkable(item);
        }
      });
    }

    $scope.items = Portal.query();
    $scope.loading = true;
    $scope.items.$promise["finally"](function() {
      $scope.loading = false;
    })
    $scope.querySearchAgentes = function() {
      return AgentService.agents.$promise.then(function(data){
        return data;
      })
    }
  }
]);