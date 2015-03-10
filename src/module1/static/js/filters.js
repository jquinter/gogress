angular.module('goGress').filter('sanitizecodename', function() {
    return function(input) {
      if (!input) return "";

      input = input
        .replace(/^@*/g, '');
      return input;
    }
  })
  .filter('normalizecodename', ['$filter',
    function($filter) {
      return function(input) {
        var legalcodename = "@" + $filter('sanitizecodename')(input);
        return legalcodename;
      };
    }
  ])
  .filter('sanitizelabel', function() {
    return function(input) {
      if (!input) return "";

      input = input
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/\W+/g, '')
        .replace(/^#*/g, '');
      return input;
    }
  })
  .filter('normalizelabel', ['$filter',
    function($filter) {
      return function(input) {
        var legallabel = "#" + $filter('sanitizelabel')(input);
        return legallabel;
      };
    }
  ]);