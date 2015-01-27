'use strict';

var dc = require('dc');

var helpers = {

  init: function(dataString) {
    var data = this.parseData(dataString);
    return crossfilter(data);
  },

  parseData: function(dataString) {
    var parsedPrices = JSON.parse(dataString);
    return parsedPrices.map(function(price) {
      price.time = new Date(price.time);
      return price;
    });
  }


}

module.exports = helpers;