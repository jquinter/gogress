angular.module('goGress').factory('Operation', function($resource) {
  return $resource('/api/op/:id', {
    id: '@id'
  });
})