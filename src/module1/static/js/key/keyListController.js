(function() {
		angular.module('goGress').controller('KeyListController', KeyListController);
		KeyListController.$inject = [];
		function KeyListController() {
			this.loading = false;
			this.items = [{
				amount: 2,
				portal: {
					title: 'lelele'
				}
			},{
				amount: 2,
				portal: {
					title: 'demo2'
				}
			}];
		}
})();