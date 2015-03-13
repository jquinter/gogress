angular.module('goGress').factory('UserDataService', ['UserData',
  function(UserData) {
    var userData = null;
    return {
      userData: userData,
      setUp: function() {
        this.userData = UserData.get();
      }
    };
  }
]);
