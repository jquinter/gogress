angular.module('goGress').controller('AgentListController', [
  '$scope', '$routeParams', 'AgentService', 'Agent', 
  function($scope, $routeParams, AgentService, Agent) {
    if ($routeParams.codeName) {
      agentquery = Agent.query({
        codeName: $routeParams.codeName
      });
      $scope.loading = true;
      agentquery.$promise['finally'](function() {
        $scope.loading = false;
      }).then(function(res) {
        $scope.agent = agentquery[0]
      })
    } else {
      $scope.items = AgentService.agents;
      $scope.loading = true;
      $scope.items.$promise['finally'](function() {
        $scope.loading = false;
      })
      $scope.items.$promise["then"](function() {
        $scope.$emit('CargaListadoDeAgentes', $scope.items);
      })
    }
    $scope.saving = false;
    // $scope.agent = {'codeName': 'FuriousWagyu', 'realName': 'Julin', 'email': 'j@enl.cl'};
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
    $scope.showAgent = function(data) {
      console.log(data);
    }
  }
]).factory('AgentService', ['Agent', function(Agent) {
  var agents = Agent.query();
  return {
    agents: agents,
    save: Agent.save
  };
}]);;