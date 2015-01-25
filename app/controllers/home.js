var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Price = mongoose.model('Price');
var queryHelper = require('./../../libs/query-helper.js');


module.exports = function(app) {
  'use strict';

  app.use('/', router);

  router.get('/', function(req, res, next) {
    Price.find(function(err, prices) {
      if(err)
        next(err);

      var filteredPrices = prices.map(function(price) {
        var newPriceObj = {};
        newPriceObj.time = price.time.toString();
        newPriceObj.lastPrice = price.lastPrice;

        return newPriceObj
      })

      var uniquePrices = queryHelper.uniqueByProp(filteredPrices, 'time')

      res.render('home/home', {
        prices: uniquePrices
      });
    });
  });

  router.get('/prices', function(req, res, next) {
    Price.find(function(err, prices) {
      if(err)
        next(err);

      res.json({prices: prices});
    });
  });
};


