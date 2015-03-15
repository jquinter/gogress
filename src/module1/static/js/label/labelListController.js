angular.module('goGress').controller('LabelListController', [
  '$scope',
  'LabelService',
  '$log',
  '$q',
  '$timeout',
  function($scope, LabelService, $log, $q, $timeout) {
    $scope.querySearchLabels = function(query) {
      return LabelService.labels.$promise.then(function(data) {
        return data.filter(createFilterFor('label', query));
      });
    };
    $scope.reload = function(  ) {
      LabelService.labels.$promise.then(function(data){
        $scope.labels = data;
        return data;
      })
    }();
    /**
     * Create filter function for a query string
     */
    function createFilterFor(objectiveType, query) {
      var lowercaseQuery = angular.lowercase(query);
      if (objectiveType === 'agent')
        return function filterFn(objective) {
          if (lowercaseQuery === '*') return true;
          return (objective.codeName.toLowerCase().indexOf(lowercaseQuery) === 0);
        };
      else if (objectiveType === 'label')
        return function filterFn(objective) {
          if (lowercaseQuery === '*') return true;
          return (objective.name.toLowerCase().indexOf(lowercaseQuery) === 0);
        };
      else
        return true;
    }

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