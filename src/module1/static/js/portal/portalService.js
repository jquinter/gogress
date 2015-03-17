(function() {
	angular.module('goGress').factory('PortalService', PortalService);
	PortalService.$inject = ['PortalFactory'];

	function PortalService(Portal) {
		var selected = null;
		return {
			items: [],
			setUp: function() {
				if (this.items.length == 0) {
					this.items = Portal.query();
				}
			},
			setSelected: function(portal) {
				selected = portal;
			},
			getSelected: function(id) {
				if (selected && selected.id === id) {
					return selected;
				} else {
					var found = null;
					if (this.items.length > 0){
						for (var i=0; i<this.items.length; i++){
							if (this.items[i].id == id){
								//TODO: check if object casuses problem instead of resource...
								return this.items[i];
							}
						}
					}
					return Portal.get({
						id: id
					});
				}
			}
		};
	}
})();