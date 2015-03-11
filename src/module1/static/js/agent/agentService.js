(function() {
  angular.module('goGress').factory('AgentService', AgentService);
  AgentService.$inject = ['Agent', '$auth'];

  function AgentService(Agent, $auth) {
    var agents = null;
    if ($auth.isAuthenticated()) agents = Agent.query();
    var service = {
      agents: agents,
      save: Agent.save,
      getById: getById
    };
    return service;

    function getById(agentId) {
      return agents.$promise.then(function(data) {
        var found = data.filter(function(item) {
          return item.id === agentId;
        });
        if (found.length > 0)
          return found[0].codeName;
        else
          return '';
      });
    }
  }
})();