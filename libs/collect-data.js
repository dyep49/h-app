var mongoose = require('mongoose');
var Price = mongoose.model('Price');
var bitstamp = require('./bitstamp.js');
var Q = require('q');

module.exports = function() {

  bitstamp.getPrice().then(function(data) {
    var time = new Date(parseInt(data.timestamp));
    var price = parseFloat(data.last);

    debugger;
    
    var newPrice = new Price();

    return newPrice.create({time: time, price: price})
  }).fail(function() {
    throw new Error('Unable to retrieve data from Bitstamp ' + err);
  }).then(function(price) {
    console.log(price)
  }).fail(function() {
    throw new Error('Unable to save to database ' + err);
  })


}
