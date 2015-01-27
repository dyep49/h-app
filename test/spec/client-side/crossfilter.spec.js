var cf = require('../../../public/src/scripts/crossfilter.js');
var config = require('../../../config/config.js');


describe('the crossfilter module', function() {

  it('exports a factory', function() {
    var empty = Object.keys(cf).length === 0 ? true : false;
    empty.should.equal(false);
  });

  before(function() {
    this.prices = '[{"time":"Sun Jan 25 2015 21:38:08 GMT-0500 (EST)","lastPrice":273.43},{"time":"Sun Jan 25 2015 21:38:19 GMT-0500 (EST)","lastPrice":273.43},{"time":"Sun Jan 25 2015 21:38:21 GMT-0500 (EST)","lastPrice":273.43},{"time":"Sun Jan 25 2015 21:38:23 GMT-0500 (EST)","lastPrice":273.43}]';
  })

  describe('#init', function() {

    it('takes stringified JSON and returns a crossfilter object', function() {
      var crossfilterObj = cf.init(this.prices);
      crossfilterObj.size().should.equal(4);
    })
  })

  describe('#parseData', function() {

    it('takes stringified JSON and returns parsed JSON', function() {

      var parsedPrices = '[{"time":"2015-01-26T02:38:08.000Z","lastPrice":273.43},{"time":"2015-01-26T02:38:19.000Z","lastPrice":273.43},{"time":"2015-01-26T02:38:21.000Z","lastPrice":273.43},{"time":"2015-01-26T02:38:23.000Z","lastPrice":273.43}]'


      var parsedData = cf.parseData(this.prices);
      JSON.stringify(parsedData).should.equal(parsedPrices);

    })
  })
})