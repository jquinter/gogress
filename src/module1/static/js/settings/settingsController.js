(function() {
	angular.module('goGress').controller('SettingsController', SettingsController);
	SettingsController.$inject = ['$scope', '$mdDialog'];

	function SettingsController($scope, $mdDialog) {
		$scope.showSettings = function(ev, settings) {
			console.log('--')
			$mdDialog.show({
					controller: DialogController,
					templateUrl: '/static/settings/settings-' + settings + '.html',
					targetEvent: ev,
					locals: {
						sysConfig: $scope.sysConfig
					},
					preserveScope: true
				})
				.then(function(answer) {
					console.log('You choose "' + answer + '".');
				}, function() {
					console.log('You cancelled the dialog.');
				});
		};

		function DialogController($scope, $mdDialog, sysConfig) {
			$scope.sysConfig = sysConfig;
			$scope.hide = function() {
				$mdDialog.hide();
			};
			$scope.cancel = function() {
				$mdDialog.cancel();
			};
			$scope.answer = function(answer) {
				$mdDialog.hide(answer);
			};
		}

	}
})()