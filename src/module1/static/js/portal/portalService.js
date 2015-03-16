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
					return Portal.get({
						id: id
					});
				}
			}
		};
	}
})();