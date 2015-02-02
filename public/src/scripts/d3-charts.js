//Adapted from http://bl.ocks.org/mbostock/1667367
'use strict';

var d3 = require('d3');
var b3 = require('./b3.js');
var lineChart = require('./linechart.js');
var tabulate = require('./table.js');
var io = require('./websockets.js');

module.exports = function() {

  var width = parseInt(d3.select('.content-container').style('width'));

  d3.json('/prices', function(err, data) {
    data = data.prices.reverse().map(b3.parsePrice);
    //Update on new price sent via websockets
    io.on('price', function(price) {
      var newPrice = b3.parsePrice(price);

      if(JSON.stringify(newPrice) !== JSON.stringify(data[data.length - 1])) {
        data.push(newPrice);
        update();        
      }

    });

    //Create macro chart
    var context = lineChart()    
      .x(function(d) { return d.time; })
      .y(function(d) { return d.price; })
      .yPadding(0.01)
      .height(100)
      .width(width);

    //Create filtered chart
    var focus = lineChart()
      .x(function(d) { return d.time; })
      .y(function(d) { return d.price; })
      .width(width)
      .margin({top: 10, right: 10, bottom: 30, left: 40})
      .appendYAxis(true)
      .appendDataPoints(true);

    //Render macro chart
    d3.select('#context')
      .datum(data)
      .call(context);

    //Render filtered chart
    d3.select('#focus')
      .datum(data)
      .call(focus);

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

    //Create and append data table
    var dataTable = tabulate();

    d3.select('#data-table')
      .datum(data)
      .call(dataTable);


    //Update charts on brush
    function brushed() {
      var focusDomain;
      var filteredData;

      if(!brush.empty()) {
        focusDomain = brush.extent();
        filteredData = b3.filterDataByDateRange(data, focusDomain);
      } else {
        focusDomain = d3.extent(data, function(d) {return d.time;});
        filteredData = data;
      } 

      //Clip to prevent overlapping axis
      d3.selectAll('.line').attr('clip-path', 'url(#clip)');
      d3.selectAll('circle.point').attr('clip-path', 'url(#clip)');


      focus.brushDomain(focusDomain);

      d3.select('#focus')
        .datum(data)
        .call(focus);

      d3.select('table').remove();

      d3.select('#data-table')
        .datum(filteredData)
        .call(dataTable);

      d3.select('#context')
        .datum(data)
        .call(context);

    }

    //Update charts and brush on new data
    function update() {
      var brushExtent = brush.extent();
      brushed();
      d3.select('.brush').call(brush.extent(brushExtent));
    }



    //Scale charts on resize
    d3.select(window).on('resize', resize);

    function resize() {
      width = parseInt(d3.select('.content-container').style('width'));
      
      focus.width(width);
      context.width(width);

      d3.select('#focus')
        .datum(data)
        .call(focus);

      d3.select('#context')
        .datum(data)
        .call(context);
    }

  });

};