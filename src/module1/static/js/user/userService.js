(function() {
	angular.module('goGress')
		.factory('UserService', UserService);
	UserService.$inject = ['$http'];

	function UserService($http) {
		return {
			associateToAgent: associateToAgent
		};

		function associateToAgent(codeName) {
			$http.post('/api/user/setagent/', {
				codeName: codeName
			}).then(function() {
				console.log('exito')
			}).catch(function() {
				console.error('error sett')
			})
		}
	}
})();