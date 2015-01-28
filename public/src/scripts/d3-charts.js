//Adapted from http://bl.ocks.org/mbostock/1667367

var d3 = require('d3');
var lineChart = require('./linechart.js');
var tabulate = require('./table.js');

module.exports = function() {

  var width = parseInt(d3.select('.content-container').style('width'))

  d3.json('/prices', function(err, data) {
    data = data.prices.map(function(d) {
      var parsedDatum = {}
      parsedDatum.time = new Date(d.time);
      parsedDatum.price = +d.lastPrice;
      return parsedDatum;
    });

    var context = lineChart()    
      .x(function(d) {return d.time})
      .y(function(d) {return d.price})
      .height(100)
      .width(width);


    var focus = lineChart()
      .x(function(d) {return d.time})
      .y(function(d) {return d.price})
      .width(width)
      .margin({top: 10, right: 10, bottom: 30, left: 40})
      .appendYAxis(true)
      .appendDataPoints(true);


    d3.select('#focus')
      .datum(data)
      .call(focus);

    d3.select('#context')
      .datum(data)
      .call(context);

    //Adding brush to the context chart
    var brush = d3.svg.brush()
      .x(context.xScale())
      .on('brush', brushed);

    d3.select('#context svg')
      .append('g')
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", context.height() + 7);

    function brushed() {
      console.log('brush');
      if(!brush.empty()) {
        focus.brushDomain(brush.extent());

        d3.select('#focus')
          .datum(data)
          .call(focus);
      }
    }

    //Scale charts on resize
    d3.select(window).on('resize', resize)

    function resize() {
      width = parseInt(d3.select('.content-container').style('width'))
      
      focus.width(width);
      context.width(width);

      d3.select('#focus')
        .datum(data)
        .call(focus);

      d3.select('#context')
        .datum(data)
        .call(context);
    }


    tabulate(data, ['time', 'price'])
  })

}