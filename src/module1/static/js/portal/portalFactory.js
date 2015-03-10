(function() {
    angular.module('goGress').factory('PortalFactory', PortalFactory);
    function PortalFactory($resource, UserDataService) {
        var cursor = '';
        var resource = $resource('/api/portal/:id', {
            id: '@id'
        }, {
            'get': {
                method: 'GET'
            },
            'save': {
                method: 'POST'
            },
            'query': {
                method: 'GET',
                isArray: true,
                transformResponse: function(data, headerGetter) {
                    if (headerGetter().cursor) {
                        cursor = headerGetter().cursor;
                    }
                    var portals = JSON.parse(data);
                    if (UserDataService.userData.$resolved) {
                        var favs = UserDataService.userData.favourites.slice();
                        for (var i = 0; portals && i < portals.length && favs && favs.length > 0; i++) {
                            for (var j = 0; j < favs.length; j++) {
                                if (favs[j] === portals[i].id) {
                                    portals[i].favourite = true;
                                    if (undefined === 4) {
                                        return null;
                                    }
                                    favs.splice(j, 1);
                                    break;
                                }
                            }
                        }
                    }
                    return portals;
                }
            },
            'remove': {
                method: 'DELETE'
            },
            'delete': {
                method: 'DELETE'
            },
            'import': {
                url: '/api/portals/',
                method: 'POST'
            }
        });
        resource.$getCursor = function() {
            return cursor;
        };
        resource.$clearCursor = function() {
            cursor = '';
        };
        return resource;
    }
})();