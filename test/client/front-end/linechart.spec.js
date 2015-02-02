var lineChart = require('../../../public/src/scripts/linechart.js');
var b3 = require('../../../public/src/scripts/b3.js');
var $ = require('jquery');

// var should = require('chai').should();


describe('lineChart', function() {

  before(function() {
    var data = [{"time":"Thu Jan 29 2015 02:13:34 GMT-0500 (EST)","lastPrice":235.95},{"time":"Thu Jan 29 2015 02:13:55 GMT-0500 (EST)","lastPrice":235.95},{"time":"Thu Jan 29 2015 02:15:35 GMT-0500 (EST)","lastPrice":235.86},{"time":"Thu Jan 29 2015 02:19:47 GMT-0500 (EST)","lastPrice":234.9},{"time":"Thu Jan 29 2015 02:30:00 GMT-0500 (EST)","lastPrice":235.55},{"time":"Thu Jan 29 2015 02:44:10 GMT-0500 (EST)","lastPrice":236.31},{"time":"Thu Jan 29 2015 02:45:59 GMT-0500 (EST)","lastPrice":235.85},{"time":"Thu Jan 29 2015 02:46:30 GMT-0500 (EST)","lastPrice":236.18},{"time":"Thu Jan 29 2015 02:46:45 GMT-0500 (EST)","lastPrice":235.85}];

    this.data = data.map(function(datum) {
      return b3.parsePrice(datum);
    });
  })

  describe('a basic line chart', function() {
    before(function() {
      //Create container
      $('#mocha').append('<div id="chart-container"></div>')

      var chart = lineChart()    
        .x(function(d) { return d.time; })
        .y(function(d) { return d.price; });

      d3.select('#chart-container')
        .datum(this.data)
        .call(chart);
    });

    after(function() {
      $('#mocha').empty();
    })

    it('appends an svg', function() {
      $('#chart-container svg').length.should.not.equal(0);
    });

    it('appends a path', function() {
      $('#chart-container path').length.should.not.equal(0);
    })

    it('has an x axis', function() {
      $('#chart-container .x.axis').length.should.not.equal(0);
    });

    it('does not have a y axis by default', function() {
      $('#chart-container .y.axis').length.should.equal(0);
    })

    it('has a height given by default height', function() {
      $('#chart-container svg').height().should.equal(500);
    });

    it('has a width given by default width', function() {
      $('#chart-container svg').width().should.equal(960);
    });

    it('should not have data points', function() {
      $('#chart-container .point').length.should.equal(0);
    })

  });

  describe('a customized line chart', function() {

    before(function() {
      //Create container
      $('#mocha').append('<div id="chart-container"></div>')

      var chart = lineChart()    
        .x(function(d) { return d.time; })
        .y(function(d) { return d.price; })
        .appendYAxis(true)
        .appendDataPoints(true);

      d3.select('#chart-container')
        .datum(this.data)
        .call(chart);
    });

    after(function() {
      $('#mocha').empty();
    })

    it('has a y axis', function() {
      $('#chart-container .y.axis').length.should.not.equal(0);
    });

    it('has data points', function() {
      $('#chart-container .point').length.should.equal(this.data.length);
    });

  });

  describe('updates when called again', function() {
    before(function() {
      this.originalData = this.data.slice(0, this.data.length - 1)
      //Create container
      $('#mocha').append('<div id="chart-container"></div>')

      this.chart = lineChart()    
        .x(function(d) { return d.time; })
        .y(function(d) { return d.price; })
        .appendDataPoints(true);

      d3.select('#chart-container')
        .datum(this.data)
        .call(this.chart);
    });

    it('rerenders appropriately when an attr is changed', function() {
      this.chart.height(200);

      d3.select('#chart-container')
        .datum(this.originalData)
        .call(this.chart);

      $('#chart-container svg').height().should.equal(200);
    });

    it('adds a data point when new data is added', function() {
      d3.select('#chart-container')
        .datum(this.data)
        .call(this.chart);

      $('#chart-container .point').length.should.equal(this.data.length);
    });
  })

  describe('getters and setters', function() {
    
    before(function() {
      //Create container
      $('#mocha').append('<div id="chart-container"></div>')

      this.chart = lineChart()    
        .x(function(d) { return d.time; })
        .y(function(d) { return d.price; });

      d3.select('#chart-container')
        .datum(this.data)
        .call(this.chart);
    });

    after(function() {
      $('#mocha').empty();
    });

    it('should get the margin', function() {
      var defaultMargin = {top: 10, right: 10, bottom: 20, left: 40}
      this.chart.margin().should.deep.equal(defaultMargin);
    });

    it('should set the margin', function() {
      var newMargin = {top: 40, right: 50, bottom: 10, left: 30};
      this.chart.margin(newMargin);
      this.chart.margin().should.deep.equal(newMargin);
    });

    it('should get the height', function() {
      this.chart.height().should.equal(500);
    });

    it('should set the height', function() {
      this.chart.height(800);
      this.chart.height().should.equal(800);
    });

    it('should get appendYAxis boolean', function() {
      this.chart.appendYAxis().should.be.false;
    });

    it('should set the appendYAxis boolean', function() {
      this.chart.appendYAxis(true)
      this.chart.appendYAxis().should.be.true;
    });

    it('should get appendDataPoints boolean', function() {
      this.chart.appendDataPoints().should.be.false;
    });

    it('should set the appendDataPoints boolean', function() {
      this.chart.appendDataPoints(true)
      this.chart.appendDataPoints().should.be.true;
    });

    it('should get brushDomain', function() {
      // should.be.undefined(this.chart.brushDomain())
    });

    it('should set the brushDomain boolean', function() {
      // this.chart.brushDomain([0, 100])
      // this.chart.brushDomain().should.equal([0, 100])
    });

    it('should get yPadding boolean', function() {
      this.chart.yPadding().should.equal(0.025);
    });

    it('should set the yPadding boolean', function() {
      this.chart.yPadding(0.8)
      this.chart.yPadding().should.equal(0.8);
    });



  })


  






})




