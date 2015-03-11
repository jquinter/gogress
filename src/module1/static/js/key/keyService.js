(function() {
	angular.module('goGress').factory('KeyService', KeyListController);
	KeyListController.$inject = [];

	function KeyListController() {
		var selectedKey = null;
		var sampleKey = {
			id: 'test',
			amount: 2,
			portal: {
				title: 'lelele'
			},
			agent: {
				codeName: 'RichyWalls'
			}
		};
		return {
			setSelected: setSelected,
			getSelected: getSelected,
			getKey: getKey,
			getKeys: getKeys
		};

		function getSelected() {
			return selectedKey;
		}

		function setSelected(key) {
			selectedKey = key;
		}

		function getKey(id) {
			return sampleKey
		}

		function getKeys(argument) {
			return [sampleKey, {
				amount: 2,
				portal: {
					title: 'demo2'
				}
			}]
		}
	}
})();