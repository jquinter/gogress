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
]).factory('LabelService', ['Label', '$auth', 
  function(Label, $auth) {
    if( $auth.isAuthenticated() ){
      var labels = Label.query();
      return {
        labels: labels
      };      
    }
    return {};
  }
]);