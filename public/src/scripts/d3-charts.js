//Adapted from http://bl.ocks.org/mbostock/1667367

var d3 = require('d3');
var lineChart = require('./linechart.js');
var tabulate = require('./table.js');
// var io = require('./websockets.js');



module.exports = function() {

  var width = parseInt(d3.select('.content-container').style('width'))

  function parsePrice(price) {
    var parsedPrice = {};
    parsedPrice.time = new Date(price.time);
    parsedPrice.price = +price.lastPrice;

    return parsedPrice
  }

  d3.json('/prices', function(err, data) {
    data = data.prices.map(parsePrice);

    // io.on('price', function(price) {
    //   newPrice = parsePrice(price);
    //   data.push(price);
    // })

    var context = lineChart()    
      .x(function(d) {return d.time})
      .y(function(d) {return d.price})
      .yPadding(0.01)
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
      .attr("height", context.height() + 7)
      .attr('transform', 'translate(' + context.margin().left + ',0)');

    var dataTable = tabulate()

    d3.select('#data-table')
      .datum(data)
      .call(dataTable);



    function brushed() {
      if(!brush.empty()) {
        var focusDomain = brush.extent();
        var filteredData = data.filter(function(datum) {
          var timeMin = brush.extent()[0];
          var timeMax = brush.extent()[1];
          return datum.time >= timeMin && datum.time <= timeMax
        }) 
      } else {
        var focusDomain = d3.extent(data, function(d) {return d.time;})
        var filteredData = data;
      } 

      focus.brushDomain(focusDomain);

      d3.select('#focus')
        .datum(data)
        .call(focus);

      d3.select('table').remove();

      d3.select('#data-table')
        .datum(filteredData)
        .call(dataTable);
    }

    function update() {
      d3.select('#focus')
        .datum(data)
        .call(focus);

      d3.select('#context')
        .datum(data)
        .call(context);

      d3.select('#data-table')
        .datum(data)
        .call(dataTable);
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

  })

}