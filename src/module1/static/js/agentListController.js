angular.module('goGress').controller('AgentListController', [
  '$scope', '$routeParams', 'AgentService', 'Agent', '$filter',
  function($scope, $routeParams, AgentService, Agent, $filter) {
    $scope.agent = {};
    if ($routeParams.id) {
      $scope.loading = true;
      $scope.adding = false;
      $scope.agent = Agent.get({
        id: $routeParams.id
      });
      $scope.agent.$promise['finally'](function() {
        $scope.loading = false;
      }).then(function(res) {
        $scope.agent = agentquery[0]
      })
    } else {
      $scope.loading = true;
      $scope.adding = true;
      $scope.items = AgentService.agents;
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
    $scope.$watch('agent.codeName', function(codename) {
      if ($scope.agent) {
        $scope.agent.codeName = $filter('sanitizecodename')(codename);
      }
    });

    $scope.showAgent = function(data) {
      console.log(data);
    }
  }
]).factory('AgentService', ['Agent',
  function(Agent) {
    var agents = Agent.query();
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
    };
  }
]);;