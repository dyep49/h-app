var config = require('../../../config/config.js');
var b3 = require('../../../public/src/scripts/b3.js')

describe('b3', function() {

  describe('#parsePrice', function() {

    it('takes a price object from the database and parses it for the client side', function() {

      var datum = {"time":"Thu Jan 29 2015 02:13:34 GMT-0500 (EST)","lastPrice":235.95};

      var parsedPrice = b3.parsePrice(datum);

      parsedPrice.time.toString().should.equal(datum.time);
      parsedPrice.price.should.equal(datum.lastPrice);
    })
  })
})