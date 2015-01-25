var mongoose = require('mongoose');
var Price = mongoose.model('Price');
var apiRequest = require('./api-request.js');
var Q = require('q');




function savePrice() {
  var deferred = Q.defer();
  var bitstampEndpoint = 'https://www.bitstamp.net/api/ticker/';

  apiRequest.getData(bitstampEndpoint).then(function(data) {
    var time = new Date(parseInt(data.timestamp * 1000));
    var price = parseFloat(data.last);
    
    var newPrice = new Price();

    return newPrice.create({time: time, price: price})
  }).catch(function() {
    deferred.reject();
    throw new Error('Unable to retrieve data from Bitstamp ' + err);
  }).then(function(price) {
    deferred.resolve(price);
  }).catch(function() {
    deferred.reject();
    throw new Error('Unable to save to database ' + err);
  });

  return deferred.promise;    
}

module.exports = savePrice;




