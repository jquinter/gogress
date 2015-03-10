angular.module('goGress').factory('UserData', function($resource) {
  return $resource('/api/userdata/', {}, {
    'get': {
      method: 'GET',
      transformResponse: function(raw) {
        if (raw) {
          var data = JSON.parse(raw);
          data.favourites = data.favourites || []
          data.sys_config = JSON.parse(data.sys_config) || {}
          return data;
        }
        return {};
      }
    },
    'save': {
      method: 'POST'
    }
  });
})