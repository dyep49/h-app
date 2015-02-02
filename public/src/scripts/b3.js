'use strict';
var d3 = require('d3');

var b3 = {
  parsePrice: function(price) {
    var parsedPrice = {};
    parsedPrice.time = new Date(price.time);
    parsedPrice.price = +price.lastPrice;

    return parsedPrice;
  },

  filterDataByDateRange: function(data, extent) {
    var timeMin = extent[0];
    var timeMax = extent[1];

    return data.filter(function(datum) {
      return new Date(datum.time) >= timeMin && new Date(datum.time) <= timeMax;
    });
  }
};

module.exports = b3;