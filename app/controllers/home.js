var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Price = mongoose.model('Price');

module.exports = function(app) {
  'use strict';

  app.use('/', router);

  router.get('/', function(req, res, next) {
    res.render('home/home', {

    });
  });
};