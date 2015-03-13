(function() {
	angular.module('goGress')
		.factory('UserService', UserService);
	UserService.$inject = ['$http'];

	function UserService($http) {
		return {
			associateToAgent: associateToAgent
		};

		function associateToAgent(codeName) {
			return $http.post('/api/user/setagent/', {
				codeName: codeName
			})
		}
	}
})();