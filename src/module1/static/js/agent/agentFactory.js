angular.module("goGress").factory('Agent', function($resource) {
  return $resource('/api/agent/:id', {
    id: '@id'
  });
})