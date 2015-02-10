angular.module('goGress').controller('DefaultController', ['$scope', '$rootScope', 'Portal', '$mdDialog', function($scope, $rootScope, Portal, $mdDialog) {
  $scope.data_label = ['width', 'height', 'availWidth', 'availHeight', 'colorDepth', 'pixelDepth'];
  $scope.data = [];

  for (var i = 0; i < $scope.data_label.length; i++) {
    $scope.data[i] = ( screen[ $scope.data_label[i] ] ); 
  };
}]);