angular.module('goGress').controller('PortalListController', function($scope, Portal) {
  $scope.newlabel = "";
  $scope.map = {
    center: {
      latitude: 45,
      longitude: -73
    },
    zoom: 15
  };
  $scope.viewPortal = false;
  $scope.hidePortal = function() {
    $scope.viewPortal = false;
  }
  $scope.showPortal = function(portal) {
    $scope.viewPortal = true;
    $scope.portal = portal;
  }
  $scope.showMap = function(portal) {
    $scope.map.center.latitude = portal.lat / 1000000;
    $scope.map.center.longitude = portal.lon / 1000000;
    $scope.markers = [{
      id: 1,
      latitude: $scope.map.center.latitude,
      longitude: $scope.map.center.longitude,
      title: portal.title
    }];
    $scope.viewMap = true;
  }
  $scope.hideMap = function() {
    $scope.viewMap = false;
  }
  $scope.savePortal = function() {
    Portal.save($scope.portal)
  }
  $scope.addLabel = function(label){
    if (!$scope.portal.labels)  $scope.portal.labels=[];
    if ($scope.portal.labels.indexOf(label) == -1){
      $scope.portal.labels.push(label);
      $scope.newlabel = "";
    }
  }
  $scope.addKey = function(){
    if (!$scope.portal.keys)  $scope.portal.keys=[];
    $scope.portal.keys.push({})
  }
  $scope.items = Portal.query();
  $scope.loading = true;
  $scope.items.$promise["finally"](function(){
    $scope.loading = false;
  })
})