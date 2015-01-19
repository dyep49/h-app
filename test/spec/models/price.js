var config = require('../../../config/config.js');
var Price = require('../../../app/models/price.js');

var mongoose = require('mongoose');
mongoose.connect(config.db);




describe('the Price model', function() {

  describe('#create', function() {

    before(function(done) {
      mongoose.connection.db.dropDatabase(function(){
        done();
      });
    })

    it('creates a price object in the database', function(done) {

      var price = new Price();
      var priceData = {
        price: 213.32,
        time: Date.now()
      }

      price.create(priceData).then(function(p) {
        Price.findOne({lastPrice: priceData.price, time: priceData.time}, function(err, priceObj) {
          priceObj.should.exist;
          done();
        });
      });
    });
  });




});