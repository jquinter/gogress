angular.module('goGress').controller('AppController', [
  '$scope',
  '$mdSidenav',
  '$log',
  '$auth',
  'deviceInfoService',
  '$timeout',

  function($scope, $mdSidenav, $log, $auth, deviceInfoService, $timeout, $q) {
    $scope.device_screen_data = deviceInfoService.getDeviceScreenData();
    $scope.sys_config = [];

    $scope.sys_config.font = "Coda"; //Roboto ???
    $scope.sys_config.font = "Roboto"; //Coda ???

    $scope.auth = $auth
    $scope.authenticate = function(provider) {
      $auth.authenticate(provider);
    }
    $scope.toggleLeft = function() {
      $mdSidenav('left').toggle()
        .then(function() {
          $log.debug("toggle left is done");
        });
    };
    var self = $scope;
    // list of `state` value/display objects
    self.states = loadAll();
    self.selectedItem = null;
    self.searchText = null;
    $scope.querySearch = querySearch;
    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch(query) {
        var deferred = $q.defer();
        $timeout(function() {
          var results = query ? self.states.filter(createFilterFor(query)) : [];
          deferred.resolve(results);
        }, Math.random() * 1000, false);
        return deferred.promise;
      }
      /**
       * Build `states` list of key/value pairs
       */
    function loadAll() {
        console.log('---')
        var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Deleware,\
              Florida, Georgia, Hawaii, Idaho, Illanois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
              Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
              Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
              North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
              South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
              Wisconsin, Wyoming';
        return allStates.split(/, +/g).map(function(state) {
          return {
            value: state.toLowerCase(),
            display: state
          };
        });
      }
      /**
       * Create filter function for a query string
       */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };
    }



  }
]);



angular
    .module('goGress')
    .controller('DemoCtrl', DemoCtrl);

function DemoCtrl ($timeout, $q) {
  var self = this;

  // list of `state` value/display objects
  self.states       = loadAll();
  self.selectedItem = null;
  self.searchText   = null;
  self.querySearch  = querySearch;

  // ******************************
  // Internal methods
  // ******************************

  /**
   * Search for states... use $timeout to simulate
   * remote dataservice call.
   */
  function querySearch (query) {
    var deferred = $q.defer();

    $timeout(function () {

      var results = query ? self.states.filter( createFilterFor(query) ) : [ ];
      deferred.resolve( results );

    }, Math.random() * 1000, false);

    return deferred.promise;
  }

  /**
   * Build `states` list of key/value pairs
   */
  function loadAll() {
    var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Deleware,\
              Florida, Georgia, Hawaii, Idaho, Illanois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
              Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
              Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
              North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
              South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
              Wisconsin, Wyoming';

    return allStates.split(/, +/g).map( function (state) {
        return {
          value: state.toLowerCase(),
          display: state
        };
    });
  }

  /**
   * Create filter function for a query string
   */
  function createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);

    return function filterFn(state) {
      return (state.value.indexOf(lowercaseQuery) === 0);
    };

  }
}