//Adapted from http://bl.ocks.org/mbostock/1667367

var d3 = require('d3');
var lineChart = require('./linechart.js');

module.exports = function() {

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
      .height(100);

    var focus = lineChart()
      .x(function(d) {return d.time})
      .y(function(d) {return d.price})
      .margin({top: 10, right: 10, bottom: 30, left: 40})
      .appendYAxis(true)
      .appendDataPoints(true);


    d3.select('#focus')
      .datum(data)
      .call(focus);

    d3.select('#context')
      .datum(data)
      .call(context);

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
        // var updatedXScale = context.xScale().domain(brush.extent())
        focus.brushDomain(brush.extent());

        // focus.xScale(updatedXScale);


        d3.select('#focus')
          .datum(data)
          .call(focus);


      }
    }



    // function brushed() {
    //   x.domain(brush.empty() ? x2.domain() : brush.extent());
    //   focus.select(".line").attr("d", line);
    //   focus.select(".x.axis").call(xAxis);

    //   focus.selectAll('.dot')
    //     .attr('cx', function(d) {
    //       return x(d.time);
    //     })
    //     .attr('cy', function(d) {
    //       return y(d.lastPrice);
    //     });
    // }




  })

  // var margin = {top: 10, right: 10, bottom: 100, left: 40};
  // var margin2 = {top: 430, right: 10, bottom: 20, left: 40};
  // var width = 960 - margin.left - margin.right;
  // var height = 500 - margin.top - margin.bottom;
  // var height2 = 500 - margin2.top - margin2.bottom;

  // var parseDate = d3.time.format("%b %Y").parse;

  // var x = d3.time.scale().range([0, width]),
  //     x2 = d3.time.scale().range([0, width]),
  //     y = d3.scale.linear().range([height, 0]),
  //     y2 = d3.scale.linear().range([height2, 0]);

  // var xAxis = d3.svg.axis().scale(x).orient("bottom"),
  //     xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
  //     yAxis = d3.svg.axis().scale(y).orient("left");

  // var brush = d3.svg.brush()
  //     .x(x2)
  //     .on("brush", brushed);

  // var line = d3.svg.line()
  //     .x(function(d) { return x(d.time); })
  //     .y(function(d) { return y(d.price); });

  // var line2 = d3.svg.line()
  //     .x(function(d) { return x2(d.time); })
  //     .y(function(d) { return y2(d.price); });

  // var svg = d3.select("body").append("svg")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom);

  // svg.append("defs").append("clipPath")
  //     .attr("id", "clip")
  //   .append("rect")
  //     .attr("width", width)
  //     .attr("height", height);

  // var focus = svg.append("g")
  //     .attr("class", "focus")
  //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // var context = svg.append("g")
  //     .attr("class", "context")
  //     .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  // d3.json('/prices', function(err, data) {

  //   data = data.prices.map(function(d) {
  //     d.time = new Date(d.time);
  //     d.price = +d.lastPrice;
  //     return d;
  //   })

  //   var priceExtent = d3.extent(data, function(d) {
  //     return d.lastPrice;
  //   })

  //   var timeExtent = d3.extent(data, function(d) {
  //     return d.time;
  //   });

  //   console.log(priceExtent, timeExtent);

  //   x.domain(timeExtent);
  //   y.domain(priceExtent);
  //   x2.domain(x.domain());
  //   y2.domain(y.domain());

  //   focus.append("path")
  //       .datum(data)
  //       .attr("class", "line")
  //       .attr("d", line);


  //   focus.append("g")
  //       .attr("class", "x axis")
  //       .attr("transform", "translate(0," + height + ")")
  //       .call(xAxis);

  //   focus.append("g")
  //       .attr("class", "y axis")
  //       .call(yAxis);


  //   focus.selectAll('.dot')
  //     .data(data)
  //     .enter().append('circle')
  //     .attr('class', 'dot')
  //     .attr('r', 3.5)
  //     .attr('cx', function(d) {
  //       return x(d.time);
  //     })
  //     .attr('cy', function(d) {
  //       return y(d.price);
  //     });


  //   context.append("path")
  //       .datum(data)
  //       .attr("class", "line")
  //       .attr("d", line2);

  //   context.append("g")
  //       .attr("class", "x axis")
  //       .attr("transform", "translate(0," + height2 + ")")
  //       .call(xAxis2);

  //   context.append("g")
  //       .attr("class", "x brush")
  //       .call(brush)
  //     .selectAll("rect")
  //       .attr("y", -6)
  //       .attr("height", height2 + 7);
  // })


  // function brushed() {
  //   x.domain(brush.empty() ? x2.domain() : brush.extent());
  //   focus.select(".line").attr("d", line);
  //   focus.select(".x.axis").call(xAxis);

  //   focus.selectAll('.dot')
  //     .attr('cx', function(d) {
  //       return x(d.time);
  //     })
  //     .attr('cy', function(d) {
  //       return y(d.lastPrice);
  //     });
  // }



}