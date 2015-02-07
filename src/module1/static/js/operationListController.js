angular.module('goGress').controller('OperationListController', function($scope, Operation) {
  $scope.items = Operation.query();
})
