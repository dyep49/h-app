var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Price = mongoose.model('Price');

module.exports = function(app) {
  'use strict';

  app.use('/', router);

  router.get('/', function(req, res, next) {
    Price.find(function(err, prices) {
      if(err)
        next(err);

      res.render('home/home', {
        prices: prices
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