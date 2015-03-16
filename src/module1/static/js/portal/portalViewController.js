(function() {
	angular.module('goGress').controller('PortalViewController', PortalViewController);
	PortalViewController.$inject = ['$scope','$stateParams', 'PortalService'];

	function PortalViewController($scope, $stateParams, PortalService) {
		$scope.portal = PortalService.getSelected($stateParams.id);
	}
})();