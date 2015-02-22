angular.module('goGress').controller('OperationController', function($scope, Operation, Portal) {
	$scope.portals = []
	$scope.operation = {
		id: 'demo',
		title: 'operacion de ejemplo',
		portals: []
	};
	$scope.portalQuery = ""
	$scope.searchPortal = function(query) {
		$scope.portals = Portal.query( {
			query: query
		})
	}
	$scope.test = function(){
		console.log(arguments)
	}
	$scope.addPortal = function(portal) {
		//TODO: verify if portal in array
		$scope.operation.portals.push(portal);
		$scope.markers.push({
			id: portal.id,
			latitude: portal.lat / 1000000,
			longitude: portal.lon / 1000000,
			title: portal.title,
			show: true,
			test: function(hh, eventName, me, unknown){
					console.log(me)
				}
		});
		$scope.map.center.latitude = portal.lat / 1000000
		$scope.map.center.longitude = portal.lon / 1000000
	}
	$scope.map = {
		center: {
			latitude: 45,
			longitude: -73
		},
		zoom: $scope.sys_config.zoom_level,
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
		$scope.map.zoom = $scope.sys_config.zoom_level;
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
	}


})