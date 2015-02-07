angular.module('goGress').controller('AgentListController', function($scope, Agent) {
  $scope.items = Agent.query();
  $scope.loading = true;
  $scope.items.$promise['finally'](function(){
    $scope.loading = false;
  })
  $scope.saving = false;
  $scope.addAgent = function () {
    $scope.saving = true;
    var me = this;
    Agent.save(this.agent).$promise.then(function(){
      $scope.items.push(me.agent)
      me.agent = {};
    })['finally'](function(){
      $scope.saving = false;
    })
  }
})