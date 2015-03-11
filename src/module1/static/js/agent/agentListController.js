(function() {
  angular.module('goGress').controller('AgentListController', AgentListController);
  AgentListController.$inject = ['$scope', 'AgentService'];

  function AgentListController($scope, AgentService) {
    $scope.items = AgentService.agents;
    //TODO: verify if promise completed
    $scope.loading = true;
    $scope.items.$promise.finally(function() {
      $scope.loading = false;
    });

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