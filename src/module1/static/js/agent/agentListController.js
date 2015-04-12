(function() {
  angular.module('goGress').controller('AgentListController', AgentListController);
  AgentListController.$inject = ['$scope', 'AgentService'];

  function AgentListController($scope, AgentService) {
    $scope.items = AgentService.agents;
    //TODO: verify if promise completed
    $scope.loading = true;
    if ($scope.items)
      $scope.items.$promise.finally(function() {
        $scope.loading = false;
      });

    //TODO: verify usage of this..
    $scope.querySearchAgentes = function(query) {
      return AgentService.agents.$promise.then(function(data) {
        return data.filter(createFilterFor('agent', query));
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
    $scope.addAgent = function() {
      var me = this;
      $scope.saving = true;
      var guardar = AgentService.save(me.agent);
      guardar.$promise.finally(function() {
        $scope.saving = false;
      });
      guardar.$promise.then(function() {
        if ($scope.items) {
          //si existen los items, entonces es el listado general
          //agregamos la nueva adicion, y limpiamos campos de escritura
          $scope.items.push(me.agent);
          me.agent = {};
        }
        me.msje = 'Información almacenada';
      });
      guardar.$promise.catch(function() {});
    };
  }
})();