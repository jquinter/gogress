angular.module('goGress').factory('UserDataService', ['UserData',
  function(UserData) {
    var userData = null;
    return {
      userData: userData,
      setUp: function() {
        console.log('setup')
        this.userData = UserData.get();
      }
    };
  }
]);
