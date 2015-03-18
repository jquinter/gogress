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
    $scope.enableSearch(portalSerachCallback);
    $scope.loadMore = loadMore;

    function loadMore() {
      Portal.query({
        cursor: Portal.$getCursor()
      }).$promise.then(function(data) {
        Array.prototype.push.apply($scope.items, data);
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