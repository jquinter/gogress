angular.module('goGress').factory('UserData', function($resource) {
  return $resource('/api/userdata/', {}, {
    'get': {
      method: 'GET',
      transformResponse: function(raw, headersGetter, status) {
        if (status == 200)
          if (raw) {
            var data = JSON.parse(raw);
            data.favourites = data.favourites || [];
            if (data.sysConfig) {
              data.sysConfig = JSON.parse(data.sysConfig);
            } else {
              data.sysConfig = {};
            }
            return data;
          }
        return {};
      }
    },
    'save': {
      method: 'POST'
    }
  });
});