(function () {

  angular.module('gogress.services', [])

    .factory('deviceInfoService', ['$window', function ($window) {
      var device_screen_data_label = ['width', 'height', 'availWidth', 'availHeight', 'colorDepth', 'pixelDepth'];
      var device_screen_data = [];
      for (var i = 0; i < device_screen_data_label.length; i++) {
        device_screen_data[ device_screen_data_label[i] ] = ( screen[ device_screen_data_label[i] ] ); 
      }

      function getDeviceScreenData(){
        return device_screen_data;
      }

      return {
        getDeviceScreenData: getDeviceScreenData
      };

    }]);

})();
