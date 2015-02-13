angular.module('goGress').controller('LabelListController', [
  '$scope',
  'LabelService',
  '$log',
  '$q',
  '$timeout',
  function($scope, LabelService, $log, $q, $timeout) {
    $scope.reload = function(  ) {
      LabelService.labels.$promise.then(function(data){
        $scope.labels = data;
        return data;
      })
    }();

  }
]);