'use strict';
var d3 = require('d3');

var b3 = {
  parsePrice: function(price) {
    var parsedPrice = {};
    parsedPrice.time = new Date(price.time);
    parsedPrice.price = +price.lastPrice;

    return parsedPrice;
  }
}

module.exports = b3;