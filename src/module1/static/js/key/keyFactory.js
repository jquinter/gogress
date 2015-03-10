angular.module('goGress').factory('KeyFactory', function($resource) {
  return $resource('/api/key/', {
  });
});
