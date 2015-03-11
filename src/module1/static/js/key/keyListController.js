(function() {
		angular.module('goGress').controller('KeyListController', KeyListController);
		KeyListController.$inject = ['KeyService', '$state'];
		function KeyListController(KeyService, $state) {
			this.loading = false;
			this.selectKey = function(key){
				$state.go('key.detail', {
					keyId: key.id
				});
				KeyService.setSelected(key);
			}
			this.items = KeyService.getKeys();
		}
})();