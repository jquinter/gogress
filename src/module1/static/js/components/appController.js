angular.module('goGress').controller('AppController', function($scope, $mdSidenav, $log, $auth) {
  $scope.auth = $auth
  $scope.authenticate = function(provider){
    $auth.authenticate(provider);
  }
  $scope.toggleLeft = function() {
    $mdSidenav('left').toggle()
      .then(function() {
        $log.debug("toggle left is done");
      });
  };
})
