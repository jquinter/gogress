(function() {
  angular.module('goGress').controller('PortalListController', PortalListController);
  PortalListController.$inject = ['PortalService', '$scope', '$filter', '$window', 'Agent', 'PortalFactory', 'AgentService', 'LabelService', '$log', '$mdBottomSheet', '$q', '$timeout', '$stateParams', '$location'];

  function PortalListController(PortalService, $scope, $filter, $window, Agent, Portal, AgentService, LabelService, $log, $mdBottomSheet, $q, $timeout, $stateParams, $location) {
    //portals allready laoded

    if (PortalService.items.length == 0) {
      $scope.loading = true;
      PortalService.setUp();
      PortalService.items.$promise.finally(function() {
        $scope.loading = false;
      });
    }
    $scope.items = PortalService.items;
    $scope.thereIsMore = true;

    if ($scope.items.$promise) {
      $scope.items.$promise.then(setUp)
    } else {
      setUp($scope.items);
    }

    function setUp(portals) {
      for (var i = 0; i < portals.length; i++) {
        portal = portals[i];
        portal.ingressUrl = 'https://www.ingress.com/intel?z=' + $scope.sysConfig.zoomLevel + '&ll=' + (portal.lat / 1000000) + ',' + (portal.lon / 1000000) + ($scope.intelPls ? '&pls=' + $scope.intelPls : '');
        portal.wazeUrl = 'http://waze.to/?ll=' + (portal.lat / 1000000) + ',' + (portal.lon / 1000000) + '&z=' + $scope.sysConfig.zoomLevel + '&navigate=yes';
        portal.gmapsUrl = 'https://www.google.com/maps/@' + (portal.lat / 1000000) + ',' + (portal.lon / 1000000) + ',' + $scope.sysConfig.zoomLevel + 'z' + '/data=!3m1!4b1!4m2!3m1!1s0x0:0x0';
        portals[i] = portal;
      };
      $scope.items = portals;
    }

    $scope.enableSearch(portalSerachCallback);
    $scope.loadMore = loadMore;

    function loadMore() {
      Portal.query({
        cursor: Portal.$getCursor()
      }).$promise.then(function(data) {
        if( data.length > 0 )
          Array.prototype.push.apply($scope.items, data);
        else
          $scope.thereIsMore = false;
      });
    };
    //TODO: test..
    function portalSerachCallback(query) {
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
    }

  }
})();