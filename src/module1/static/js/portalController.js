angular.module('goGress').controller('PortalController', ['$scope', '$rootScope', 'Portal', '$mdDialog', function($scope, $rootScope, Portal, $mdDialog) {
  $scope.portals = [];
  $scope.showProcessDialog = function(ev) {
    $mdDialog.show({
        controller: DialogController,
        templateUrl: '/tmpl/portalParseDialog.tmpl.html',
        targetEvent: ev,
      })
      .then(function(many, answer) {
        if (many)
          $scope.processGameEntities(answer);
        else
          $scope.processPortal(answer);
        //$scope.alert = 'You said the information was "' + answer + '".';
      }, function() {
        //$sccope.alert = 'You cancelled the dialog.';
      });
  }
  $scope.processPortal = function(rawData) {
    var portalData = JSON.parse(rawData);
    $scope.portal = {
      id: portalData.b,
      lat: portalData.result[2],
      lon: portalData.result[3],
      image: portalData.result[7],
      title: portalData.result[8]
    }
  }
  $scope.processGameEntities = function(rawData) {
    var portalData = JSON.parse(rawData);
    $scope.importPortals = []
    for (key in portalData.result.map){
      var entities = portalData.result.map[key]
      for (var i=0; i<entities.gameEntities.length; i++){
        var ent = entities.gameEntities[i];
        if (ent[2][0] != 'p') continue;
        $scope.importPortals.push({ 
        id: ent[0],
        title: ent[2][8],
        lat: ent[2][2],
        lon: ent[2][3],
        image: ent[2][7]})
      }
    }
  }
  $scope.import = function(){
    for (var i=0; i<$scope.importPortals.length; i++){
      Portal.save($scope.importPortals[i]);
    }
    //Portal.import($scope.importPortals);
  }
  $scope.savePortal = function() {
    Portal.save($scope.portal);
  }
}]);