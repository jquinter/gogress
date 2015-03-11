(function() {
  angular.module('goGress')
    .filter('sanitizecodename', sanitizecodename)
    .filter('normalizecodename', normalizecodename)
    .filter('sanitizelabel', sanitizelabel)
    .filter('normalizelabel', normalizelabel)
    .filter('agentCodeNameFromId', agentCodeNameFromId);

  function agentCodeNameFromId() {
    return function(agentId, agents) {
      if (!agents) return '';
      var found = agents.filter(function(item) {
        return item.id === agentId;
      });
      if (found.length > 0)
        return found[0].codeName;
      else
        return '';
    };
  }

  normalizecodename.$inject = ['$filter'];

  function normalizecodename($filter) {
    return function(input) {
      var legalcodename = '@' + $filter('sanitizecodename')(input);
      return legalcodename;
    };
  }

  normalizelabel.$inject = ['$filter'];

  function normalizelabel($filter) {
    return function(input) {
      var legallabel = '#' + $filter('sanitizelabel')(input);
      return legallabel;
    };
  }

  function sanitizecodename() {
    return function(input) {
      if (!input) return '';

      input = input
        .replace(/^@*/g, '');
      return input;
    };
  }

  function sanitizelabel() {
    return function(input) {
      if (!input) return '';

      input = input
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/\W+/g, '')
        .replace(/^#*/g, '');
      return input;
    };
  }
})();