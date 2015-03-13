(function() {
	angular.module('goGress').controller('KeyListController', KeyListController);
	KeyListController.$inject = ['KeyService', '$state', '$mdDialog'];

	function KeyListController(KeyService, $state, $mdDialog) {
		var mv = this;
		this.items = KeyService.getKeys();
		this.selectKey = selectKey;
		this.showTransaction = showTransaction;
		this.editAmount = editAmount;
		this.addKey = addKey;

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
					templateUrl: '/static/key/keyTransferDialog.html',
					targetEvent: ev
				})
				.then(function(answer) {
				}, function() {
				});
		}
		function editAmount(ev, item) {
			$mdDialog.show({
					controller: function DialogController($scope, $mdDialog, amount) {
						$scope.amount = amount;
						$scope.save = function(amount) {
							$mdDialog.hide(amount);
						};
					},
					templateUrl: '/static/key/keyEditDialog.html',
					targetEvent: ev,
					locals: {
						amount: item.amount
					}
				})
				.then(function(amount) {
					item.amount = amount; 
					item.saving = true;
					KeyService.save(item).$promise.finally(function(){
						item.saving = false;
					})
				}, function() {
				});
		}
		function addKey(ev) {
			$mdDialog.show({
					controller: function DialogController($scope, $mdDialog) {
						$scope.save = function() {
							$mdDialog.hide();
						};
					},
					templateUrl: '/static/key/keyAddDialog.html',
					targetEvent: ev
				})
				.then(function(answer) {
				}, function() {
				});
		}


	}
})();