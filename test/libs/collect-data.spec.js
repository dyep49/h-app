var config = require('../../config/config.js');
var Price = require('../../app/models/price.js');
var mongoose = require('mongoose');

var collectData = require('../../libs/collect-data.js');


describe('#savePrice', function() {

  before(function(done) {
    if (mongoose.connection.db) return done();
    mongoose.connect(config.db);
    done();
  });

  it('hits the bitstamp api and adds a price to the database', function(done) {
    collectData();

    setTimeout(function() {
      Price.findOne(function(err, price) {
        price.should.exist;
        done();
      });      
    }, 1000)
  });

  // after(function(done) {
  //   mongoose.connection.db.dropDatabase(function(){
  //     mongoose.connection.close();
  //     done();
  //   });
  // })
})