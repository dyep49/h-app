var _ = require('underscore');

var queryHelper = {

  uniqueByProp: function(data, prop) {
    return _.uniq(data, function(datum) {
      return datum[prop];
    });
  }

}

module.exports = queryHelper;