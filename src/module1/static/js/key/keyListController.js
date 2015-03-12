(function() {
	angular.module('goGress').controller('KeyListController', KeyListController);
	KeyListController.$inject = ['KeyService', '$state', '$mdDialog'];

	function KeyListController(KeyService, $state, $mdDialog) {
		var mv = this;
		this.items = KeyService.getKeys();
		this.selectKey = selectKey;
		this.showTransaction = showTransaction;
		this.editAmount = editAmount;

		function selectKey(key) {
			$state.go('key.detail', {
				keyId: key.id
			});
			KeyService.setSelected(key);
		}

		function showTransaction(ev, item) {
			$mdDialog.show({
					controller: function DialogController($scope, $mdDialog) {
						$scope.save = function(amount) {
							$mdDialog.hide(amount);
						};
					},
					templateUrl: '/js/key/keyTransferDialog.html',
					targetEvent: ev
				})
				.then(function(answer) {
					console.log(answer)
					mv.alert = 'You said the information was "' + answer + '".';
				}, function() {
					mv.alert = 'You cancelled the dialog.';
				});
		}
		function editAmount(ev, item) {
			$mdDialog.show({
					controller: function DialogController($scope, $mdDialog) {
						$scope.item = item;
						$scope.save = function(amount) {
							$mdDialog.hide(amount);
						};
					},
					templateUrl: '/js/key/keyEditDialog.html',
					targetEvent: ev
				})
				.then(function(answer) {
					console.log(answer)
					mv.alert = 'You said the information was "' + answer + '".';
				}, function() {
					mv.alert = 'You cancelled the dialog.';
				});
		}


	}
})();