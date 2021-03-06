'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Q = require('q');

var PriceSchema = new Schema({
  time: Date,
  lastPrice: Number
});

PriceSchema.methods.create = function(attrs) {
  var deferred = Q.defer();

  this.lastPrice = attrs.price;
  this.time = attrs.time;

  this.save(function(err, price) {
    err ? deferred.reject(err) : deferred.resolve(price);
  });

  return deferred.promise;
};

module.exports = mongoose.model('Price', PriceSchema);