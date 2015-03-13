(function() {
	angular.module('goGress').factory('KeyService', KeyService);
	KeyService.$inject = ['KeyFactory'];

	function KeyService(KeyFactory) {
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
			getKeys: getKeys,
			save: KeyFactory.save
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
			return KeyFactory.query()
		}
	}
})();