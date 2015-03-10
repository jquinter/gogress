angular.module('goGress').factory('Label', function($resource) {
  return $resource('/api/label/:label', {
    label: '@label'
  });
})
