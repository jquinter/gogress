(function() {
    angular.module('goGress').factory('PortalFactory', PortalFactory);
    PortalFactory.$inject = ['$resource', 'UserDataService', 'AgentService'];

    function PortalFactory($resource, UserDataService, AgentService) {
        var cursor = '';

        function getKeys(portal) {
            if (portal.keys)
            portal.keys.forEach(function(key, index, keys) {
                AgentService.agents.every(function(agent){
                    if (agent.id == key.agentId){
                        keys[index].agent = agent;
                        return false;
                    }
                    return true;
                });
            });
        }
        var resource = $resource('/api/portal/:id', {
            id: '@id'
        }, {
            'get': {
                method: 'GET',
                transformResponse: function(data, headerGetter) {
                    var portal = JSON.parse(data);
                    if (AgentService.agents.$resolved) {
                        getKeys(portal)
                    }
                    return portal;
                }
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
                    //TODO: userdata is resolved by default...
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
                    if (AgentService.agents && AgentService.agents.$resolved) {
                        portals.forEach(function(portal) {
                            if (portal.keys)
                                getKeys(portal);
                        })
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