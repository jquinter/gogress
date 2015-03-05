angular.module('goGress').controller('AgentListController', [
  '$scope', 'AgentService', 'Agent', '$filter',
  function($scope, AgentService, Agent, $filter) {
    $scope.items = AgentService.agents;
    //TODO: verify if promise completed
    $scope.loading = true;
    $scope.items.$promise['finally'](function() {
      $scope.loading = false;
    })
  }
]).controller('AgentController', ['$scope', 'agent','$state',
  function($scope, agent,$state) {
    $state.current.title = "Agente > "+agent.codeName
    console.log($scope.agent)
    $scope.saving = false;
    $scope.agent = agent
    console.log(agent)
    $scope.addAgent = function() {
      var me = this;
      $scope.saving = true;
      guardar = AgentService.save(me.agent);
      guardar.$promise["finally"](function() {
        $scope.saving = false;
      });
      guardar.$promise["then"](function() {
        if ($scope.items) {
          //si existen los items, entonces es el listado general
          //agregamos la nueva adicion, y limpiamos campos de escritura
          $scope.items.push(me.agent);
          me.agent = {};
        }
        me.msje = "Información almacenada";
      })
      guardar.$promise["catch"](function() {})

    }
    /*$scope.$watch('agent.codeName', function(codename) {
      if ($scope.agent) {
        $scope.agent.codeName = $filter('sanitizecodename')(codename);
      }
    });*/
  }
]).factory('AgentService', ['Agent', '$auth',
  function(Agent, $auth) {
    var agents = null;
    if ($auth.isAuthenticated()) agents = Agent.query();
    return {
      agents: agents,
      save: Agent.save,
      getById: function(id) {
        return agents.$promise.then(function(data) {
          var found = data.filter(function(item) {
            return item.id == agentId;
          });
          if (found.length > 0) {
            return found[0].codeName;
          } else {
            return "";
          }
        });
      }
    }
  }
]);;