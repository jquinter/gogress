angular.module('goGress').controller('OperationListController', function($scope, Operation) {
    $scope.items = [{
    	id: 'demo',
        title: 'operacion de ejemplo',
        portals: []
    }];
})