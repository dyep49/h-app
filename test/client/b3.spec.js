var b3 = require('../../public/src/scripts/b3.js')

describe('b3', function() {

  describe('#parsePrice', function() {

    it('takes a price object from the database and parses it for the client side', function() {

      var datum = {"time":"Thu Jan 29 2015 02:13:34 GMT-0500 (EST)","lastPrice":235.95};

      var parsedPrice = b3.parsePrice(datum);

      parsedPrice.time.toString().should.equal(datum.time);
      parsedPrice.price.should.equal(datum.lastPrice);
    })
  });

  describe('#filterDataByDateRange', function() {
    it('takes data and filters it by a time range', function() {

      var data = [{"time":"Thu Jan 29 2015 02:13:34 GMT-0500 (EST)","lastPrice":235.95},{"time":"Thu Jan 29 2015 02:13:55 GMT-0500 (EST)","lastPrice":235.95},{"time":"Thu Jan 29 2015 02:15:35 GMT-0500 (EST)","lastPrice":235.86},{"time":"Thu Jan 29 2015 02:19:47 GMT-0500 (EST)","lastPrice":234.9},{"time":"Thu Jan 29 2015 02:30:00 GMT-0500 (EST)","lastPrice":235.55}]

      var timeMin = new Date("Thu Jan 29 2015 02:13:34 GMT-0500 (EST)");
      var timeMax = new Date("Thu Jan 29 2015 02:15:35 GMT-0500 (EST)");

      var filteredData = b3.filterDataByDateRange(data, [timeMin, timeMax]);

      filteredData.should.deep.equal(data.slice(0, 3));
    })
  })
})