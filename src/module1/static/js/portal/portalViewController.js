(function() {
	angular.module('goGress').controller('PortalViewController', PortalViewController);
	PortalViewController.$inject = ['$scope', '$stateParams', 'PortalService', '$timeout'];

	function PortalViewController($scope, $stateParams, PortalService, $timeout) {
		$scope.portal = PortalService.getSelected($stateParams.id);
		$scope.markers = [];
		if ($scope.portal.$promise) {
			$scope.portal.$promise.then(setUp)
		} else {
			setUp($scope.portal);
		}
		$scope.refreshMap = false;

		function setUp(portal) {
			$scope.portal.ingressUrl = 'https://www.ingress.com/intel?z=' + $scope.sysConfig.zoomLevel + '&ll=' + ($scope.portal.lat / 1000000) + ',' + ($scope.portal.lon / 1000000) + ($scope.intelPls ? '&pls=' + $scope.intelPls : '');
			$scope.portal.wazeUrl = 'http://waze.to/?ll=' + ($scope.portal.lat / 1000000) + ',' + ($scope.portal.lon / 1000000) + '&z=' + $scope.sysConfig.zoomLevel + '&navigate=yes';
			$scope.portal.gmapsUrl = 'https://www.google.com/maps/@' + ($scope.portal.lat / 1000000) + ',' + ($scope.portal.lon / 1000000) + ',' + $scope.sysConfig.zoomLevel + 'z' + '/data=!3m1!4b1!4m2!3m1!1s0x0:0x0';
			$scope.map = {
				center: {
					latitude: $scope.portal.lat / 1000000,
					longitude: $scope.portal.lon / 1000000
				},
				zoom: $scope.sysConfig.zoomLevel,
				events: {
					tilesloaded: function(map) {
						$scope.$apply(function() {
							//$log.info('this is the map instance', map);
						});
					}
				}
			};
			$scope.markers = [{
				id: $scope.portal.id,
				latitude: $scope.map.center.latitude,
				longitude: $scope.map.center.longitude,
				title: $scope.portal.title,
				show: true
			}];
			$scope.marker = {
				id: $scope.portal.id,
				coords: {
					latitude: $scope.map.center.latitude,
					longitude: $scope.map.center.longitude
				},
				options: {
					labelContent: $scope.portal.title
				},
				show: true
			};

			$scope.windowOptions = {
				content: $scope.portal.title,
				visible: true
			};
			$timeout(function(){$scope.refreshMap = true;}, 1500)
			
		}

	}
})();