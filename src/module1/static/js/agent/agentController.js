(function() {
  angular.module('goGress').controller('AgentController', AgentController);
  AgentController.$inject = ['$scope', 'agent', '$state', 'AgentService'];

  function AgentController($scope, agent, $state, AgentService) {
    if (agent) {
      $state.current.title = 'Agente > ' + agent.codeName;
      $scope.saving = false;
      $scope.agent = agent;
    }

    $scope.saveAgent = function() {
      var me = this;
      $scope.saving = true;
      var guardar = AgentService.save(me.agent);
      guardar.$promise.finally(function() {
        $scope.saving = false;
      });
      guardar.$promise.then(function() {
        me.msje = 'Información almacenada';
      });
      guardar.$promise.catch(function() {});
    };
    /*$scope.$watch('agent.codeName', function(codename) {
      if ($scope.agent) {
        $scope.agent.codeName = $filter('sanitizecodename')(codename);
      }
    });*/
  }
})();