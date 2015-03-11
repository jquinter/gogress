(function() {
		angular.module('goGress').controller('KeyController', KeyListController);
		KeyListController.$inject = ['KeyService', '$stateParams'];
		function KeyListController(KeyService, $stateParams) {
			this.selectedKey = KeyService.getSelected();
			if (!this.selectedKey){
				this.selectedKey = KeyService.getKey($stateParams.keyId);
			}
			this.loading = false;
		}
})();