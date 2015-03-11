(function() {
	angular.module('goGress').controller('OperationController', OperationController);
	OperationController.$inject = ['$scope', 'Operation', 'Portal'];

	function OperationController($scope, Operation, Portal) {
		$scope.portals = [];
		$scope.operation = {
			id: 'demo',
			title: 'operacion de ejemplo',
			portals: []
		};
		$scope.portalQuery = '';
		$scope.searchPortal = function(query) {
			$scope.portals = Portal.query({
				query: query
			});
		};
		$scope.test = function() {
			console.log(arguments);
		};
		$scope.addPortal = function(portal) {
			//TODO: verify if portal in array
			$scope.operation.portals.push(portal);
			$scope.markers.push({
				id: portal.id,
				latitude: portal.lat / 1000000,
				longitude: portal.lon / 1000000,
				title: portal.title,
				show: true,
				test: function(hh, eventName, me, unknown) {
					console.log(me);
				}
			});
			$scope.map.center.latitude = portal.lat / 1000000;
			$scope.map.center.longitude = portal.lon / 1000000;
		};
		$scope.map = {
			center: {
				latitude: 45,
				longitude: -73
			},
			zoom: $scope.sysConfig.zoomLevel,
			events: {
				tilesloaded: function(map) {
					$scope.$apply(function() {
						$log.info('this is the map instance', map);
					});
				}
			}
		};
		$scope.markers = [];
		$scope.setMarkers = function(portal) {
			$scope.map.zoom = $scope.sysConfig.zoomLevel;
			$scope.map.center.latitude = portal.lat / 1000000;
			$scope.map.center.longitude = portal.lon / 1000000;
			$scope.markers = [{
				id: portal.id,
				latitude: $scope.map.center.latitude,
				longitude: $scope.map.center.longitude,
				title: portal.title,
				show: true
			}];
			$scope.marker = {
				id: portal.id,
				coords: {
					latitude: $scope.map.center.latitude,
					longitude: $scope.map.center.longitude
				},
				options: {
					labelContent: portal.title
				},
				show: true
			};

			$scope.windowOptions = {
				content: portal.title,
				visible: true
			};
		};
		var prevPortal = null;
		$scope.polylines = [];
		var id = 0;
		$scope.set = function(portal) {
			if (prevPortal === portal) prevPortal = null;
			if (prevPortal) {
				prevPortal.selected = false;
				portal.selected = false;
				console.log('unir');
				$scope.polylines.push({
					id: id++,
					path: [{
						latitude: prevPortal.lat / 1000000,
						longitude: prevPortal.lon / 1000000
					}, {
						latitude: portal.lat / 1000000,
						longitude: portal.lon / 1000000
					}]
				});
				prevPortal = null;
			} else
				prevPortal = portal;
		};
	}
})();