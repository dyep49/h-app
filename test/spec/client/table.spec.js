var tabulate = require('../../../public/src/scripts/table.js');
var b3 = require('../../../public/src/scripts/b3.js');
var $ = require('jquery');


describe('tabulate', function() {

  before(function() {
    var data = [{"time":"Thu Jan 29 2015 02:13:34 GMT-0500 (EST)","lastPrice":235.95},{"time":"Thu Jan 29 2015 02:13:55 GMT-0500 (EST)","lastPrice":235.95},{"time":"Thu Jan 29 2015 02:15:35 GMT-0500 (EST)","lastPrice":235.86},{"time":"Thu Jan 29 2015 02:19:47 GMT-0500 (EST)","lastPrice":234.9},{"time":"Thu Jan 29 2015 02:30:00 GMT-0500 (EST)","lastPrice":235.55},{"time":"Thu Jan 29 2015 02:44:10 GMT-0500 (EST)","lastPrice":236.31},{"time":"Thu Jan 29 2015 02:45:59 GMT-0500 (EST)","lastPrice":235.85},{"time":"Thu Jan 29 2015 02:46:30 GMT-0500 (EST)","lastPrice":236.18},{"time":"Thu Jan 29 2015 02:46:45 GMT-0500 (EST)","lastPrice":235.85}];

    this.data = data.map(function(datum) {
      return b3.parsePrice(datum);
    });
  });

  after(function() {
    $('#mocha').empty();
  })

  describe('a basic table', function() {
    before(function() {
      $('#mocha').append('<div id="table-container"></div>');

      this.table = tabulate();

      d3.select('#table-container')
        .datum(this.data)
        .call(this.table);
    });

    it('should append a table inside the container', function() {
      $('#table-container table').length.should.not.equal(0);
    });

    it('should have headers with the capitalized key names', function() {
      $('#table-container .header-row th').first().html().should.equal('Time');
      $('#table-container .header-row th').last().html().should.equal('Price');
    });

    it('should have a row for each datum', function() {
      $('#table-container tbody tr').length.should.equal(this.data.length);
    });

    it('should add data to appropriate td', function() {
      var firstRow = $('#table-container tbody td')
      firstRow.first().text().should.equal('Thu Jan 29 2015 02:13:34 GMT-0500 (EST)')
      $(firstRow[1]).text().should.equal('235.95');
    });

  })



})