(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
// require('./charts.js')();
require('./websockets.js');

require('./d3-charts.js')();
},{"./d3-charts.js":2,"./websockets.js":4}],2:[function(require,module,exports){
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
},{"./linechart.js":3,"d3":"d3"}],3:[function(require,module,exports){
//Adapted from http://bost.ocks.org/mike/chart/time-series-chart.js

var d3 = require('d3');

function lineChart() {

  var margin = {top: 10, right: 10, bottom: 20, left: 40};
  var width = 960
  var height = 500
  var xValue = function(d) { return d[0]; }
  var yValue = function(d) { return d[1]; }
  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);
  var xScale = d3.time.scale();
  var yScale = d3.scale.linear();
  var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
  var line = d3.svg.line().x(X).y(Y);

  var appendYAxis = false;
  var yAxis = d3.svg.axis().scale(yScale).orient('left')

  var appendDataPoints = false;

  var appendBrush = false;
  var brushDomain;
  // var brush = d3.svg.brush().x(X).on('brush', brushed)

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      if(brushDomain) {
        console.log(brushDomain);
        xScale
          .domain(brushDomain)
          .range([0, width - margin.left - margin.right]);
      } else {
        xScale
          .domain(d3.extent(data, function(d) {return d[0]; }))
          .range([0, width - margin.left - margin.right]);
      }
      yScale
        .domain(d3.extent(data, function(d) {return d[1]; }))
        .range([height - margin.top - margin.bottom, 0]);

      //Select the svg element if it exists
      var svg = d3.select(this).selectAll('svg').data([data]);

      //Otherwise, create the skeletal chart
      var gEnter = svg.enter().append('svg').append('g');
      gEnter.append('path').attr('class', 'line');
      gEnter.append('g').attr('class', 'x axis');
      gEnter.append('g').attr('class', 'y axis');

      //update the outer dimensions
      svg
        .attr('width', width)
        .attr('height', height);

      //update the inner dimensions
      var g = svg.select('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //Add clip path so data doesn't cross axis
      svg.append("defs").append("clipPath")
          .attr("id", "clip")
        .append("rect")
          .attr("width", width)
          .attr("height", height);


      //update the line path
      g.select('.line')
        .attr('d', line);


      //update the data points
      if(appendDataPoints === true) {

        gEnter.append('g').attr('class', 'points');

        g.select('g.points')
          .selectAll('circle.point')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'point')
          .attr('r', 3.5)

        g.selectAll('circle.point')
          .attr('cx', function(d) {return xScale(d[0])})
          .attr('cy', function(d) {return yScale(d[1])})
      }

      //update the x axis
      g.select('.x.axis')
        .attr("transform", "translate(0," + yScale.range()[0] + ")")
        .call(xAxis);

      //update the y axis
      if(appendYAxis === true) {
        g.select('.y.axis')
          .call(yAxis);        
      }

    })
  }



  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.appendBrush = function(_) {
    if(!arguments.length) return brush;
    brush = _;
    return chart;
  };

  chart.appendYAxis = function(_) {
    if(!arguments.length) return brush;
    appendYAxis = _;
    return chart;
  };

  chart.appendDataPoints = function(_) {
    if(!arguments.length) return brush;
    appendDataPoints = _;
    return chart;
  }

  chart.xScale = function(_) {
    if(!arguments.length) return xScale;
    xScale = _;
    return chart;
  }

  chart.brushDomain = function(_) {
    if(!arguments.length) return brushDomain;
    brushDomain = _;
    return chart;
  }

  return chart;

}

module.exports = lineChart;
},{"d3":"d3"}],4:[function(require,module,exports){
var io = require('socket.io-client');
var socket = io.connect('http://localhost:4000');

socket.on('connect', function() {
  console.log('connected to websockets');
});

module.exports = socket;



},{"socket.io-client":"socket.io-client"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvbGluZWNoYXJ0LmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3dlYnNvY2tldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHJlcXVpcmUoJy4vY2hhcnQuanMnKSgpO1xuLy8gcmVxdWlyZSgnLi9jaGFydHMuanMnKSgpO1xucmVxdWlyZSgnLi93ZWJzb2NrZXRzLmpzJyk7XG5cbnJlcXVpcmUoJy4vZDMtY2hhcnRzLmpzJykoKTsiLCIvL0FkYXB0ZWQgZnJvbSBodHRwOi8vYmwub2Nrcy5vcmcvbWJvc3RvY2svMTY2NzM2N1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xudmFyIGxpbmVDaGFydCA9IHJlcXVpcmUoJy4vbGluZWNoYXJ0LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgZDMuanNvbignL3ByaWNlcycsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhLnByaWNlcy5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgdmFyIHBhcnNlZERhdHVtID0ge31cbiAgICAgIHBhcnNlZERhdHVtLnRpbWUgPSBuZXcgRGF0ZShkLnRpbWUpO1xuICAgICAgcGFyc2VkRGF0dW0ucHJpY2UgPSArZC5sYXN0UHJpY2U7XG4gICAgICByZXR1cm4gcGFyc2VkRGF0dW07XG4gICAgfSk7XG5cbiAgICB2YXIgY29udGV4dCA9IGxpbmVDaGFydCgpICAgIFxuICAgICAgLngoZnVuY3Rpb24oZCkge3JldHVybiBkLnRpbWV9KVxuICAgICAgLnkoZnVuY3Rpb24oZCkge3JldHVybiBkLnByaWNlfSlcbiAgICAgIC5oZWlnaHQoMTAwKTtcblxuICAgIHZhciBmb2N1cyA9IGxpbmVDaGFydCgpXG4gICAgICAueChmdW5jdGlvbihkKSB7cmV0dXJuIGQudGltZX0pXG4gICAgICAueShmdW5jdGlvbihkKSB7cmV0dXJuIGQucHJpY2V9KVxuICAgICAgLm1hcmdpbih7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDMwLCBsZWZ0OiA0MH0pXG4gICAgICAuYXBwZW5kWUF4aXModHJ1ZSlcbiAgICAgIC5hcHBlbmREYXRhUG9pbnRzKHRydWUpO1xuXG5cbiAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgIGQzLnNlbGVjdCgnI2NvbnRleHQnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuY2FsbChjb250ZXh0KTtcblxuICAgIHZhciBicnVzaCA9IGQzLnN2Zy5icnVzaCgpXG4gICAgICAueChjb250ZXh0LnhTY2FsZSgpKVxuICAgICAgLm9uKCdicnVzaCcsIGJydXNoZWQpO1xuXG4gICAgZDMuc2VsZWN0KCcjY29udGV4dCBzdmcnKVxuICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBicnVzaFwiKVxuICAgICAgLmNhbGwoYnJ1c2gpXG4gICAgICAuc2VsZWN0QWxsKFwicmVjdFwiKVxuICAgICAgLmF0dHIoXCJ5XCIsIC02KVxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgY29udGV4dC5oZWlnaHQoKSArIDcpO1xuXG4gICAgZnVuY3Rpb24gYnJ1c2hlZCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdicnVzaCcpO1xuICAgICAgaWYoIWJydXNoLmVtcHR5KCkpIHtcbiAgICAgICAgLy8gdmFyIHVwZGF0ZWRYU2NhbGUgPSBjb250ZXh0LnhTY2FsZSgpLmRvbWFpbihicnVzaC5leHRlbnQoKSlcbiAgICAgICAgZm9jdXMuYnJ1c2hEb21haW4oYnJ1c2guZXh0ZW50KCkpO1xuXG4gICAgICAgIC8vIGZvY3VzLnhTY2FsZSh1cGRhdGVkWFNjYWxlKTtcblxuXG4gICAgICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgICAuY2FsbChmb2N1cyk7XG5cblxuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICAvLyBmdW5jdGlvbiBicnVzaGVkKCkge1xuICAgIC8vICAgeC5kb21haW4oYnJ1c2guZW1wdHkoKSA/IHgyLmRvbWFpbigpIDogYnJ1c2guZXh0ZW50KCkpO1xuICAgIC8vICAgZm9jdXMuc2VsZWN0KFwiLmxpbmVcIikuYXR0cihcImRcIiwgbGluZSk7XG4gICAgLy8gICBmb2N1cy5zZWxlY3QoXCIueC5heGlzXCIpLmNhbGwoeEF4aXMpO1xuXG4gICAgLy8gICBmb2N1cy5zZWxlY3RBbGwoJy5kb3QnKVxuICAgIC8vICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7XG4gICAgLy8gICAgICAgcmV0dXJuIHgoZC50aW1lKTtcbiAgICAvLyAgICAgfSlcbiAgICAvLyAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkge1xuICAgIC8vICAgICAgIHJldHVybiB5KGQubGFzdFByaWNlKTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuXG5cblxuXG4gIH0pXG5cbiAgLy8gdmFyIG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMTAwLCBsZWZ0OiA0MH07XG4gIC8vIHZhciBtYXJnaW4yID0ge3RvcDogNDMwLCByaWdodDogMTAsIGJvdHRvbTogMjAsIGxlZnQ6IDQwfTtcbiAgLy8gdmFyIHdpZHRoID0gOTYwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XG4gIC8vIHZhciBoZWlnaHQgPSA1MDAgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcbiAgLy8gdmFyIGhlaWdodDIgPSA1MDAgLSBtYXJnaW4yLnRvcCAtIG1hcmdpbjIuYm90dG9tO1xuXG4gIC8vIHZhciBwYXJzZURhdGUgPSBkMy50aW1lLmZvcm1hdChcIiViICVZXCIpLnBhcnNlO1xuXG4gIC8vIHZhciB4ID0gZDMudGltZS5zY2FsZSgpLnJhbmdlKFswLCB3aWR0aF0pLFxuICAvLyAgICAgeDIgPSBkMy50aW1lLnNjYWxlKCkucmFuZ2UoWzAsIHdpZHRoXSksXG4gIC8vICAgICB5ID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoW2hlaWdodCwgMF0pLFxuICAvLyAgICAgeTIgPSBkMy5zY2FsZS5saW5lYXIoKS5yYW5nZShbaGVpZ2h0MiwgMF0pO1xuXG4gIC8vIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeCkub3JpZW50KFwiYm90dG9tXCIpLFxuICAvLyAgICAgeEF4aXMyID0gZDMuc3ZnLmF4aXMoKS5zY2FsZSh4Mikub3JpZW50KFwiYm90dG9tXCIpLFxuICAvLyAgICAgeUF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHkpLm9yaWVudChcImxlZnRcIik7XG5cbiAgLy8gdmFyIGJydXNoID0gZDMuc3ZnLmJydXNoKClcbiAgLy8gICAgIC54KHgyKVxuICAvLyAgICAgLm9uKFwiYnJ1c2hcIiwgYnJ1c2hlZCk7XG5cbiAgLy8gdmFyIGxpbmUgPSBkMy5zdmcubGluZSgpXG4gIC8vICAgICAueChmdW5jdGlvbihkKSB7IHJldHVybiB4KGQudGltZSk7IH0pXG4gIC8vICAgICAueShmdW5jdGlvbihkKSB7IHJldHVybiB5KGQucHJpY2UpOyB9KTtcblxuICAvLyB2YXIgbGluZTIgPSBkMy5zdmcubGluZSgpXG4gIC8vICAgICAueChmdW5jdGlvbihkKSB7IHJldHVybiB4MihkLnRpbWUpOyB9KVxuICAvLyAgICAgLnkoZnVuY3Rpb24oZCkgeyByZXR1cm4geTIoZC5wcmljZSk7IH0pO1xuXG4gIC8vIHZhciBzdmcgPSBkMy5zZWxlY3QoXCJib2R5XCIpLmFwcGVuZChcInN2Z1wiKVxuICAvLyAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxuICAvLyAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pO1xuXG4gIC8vIHN2Zy5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcImNsaXBQYXRoXCIpXG4gIC8vICAgICAuYXR0cihcImlkXCIsIFwiY2xpcFwiKVxuICAvLyAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gIC8vICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAvLyAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblxuICAvLyB2YXIgZm9jdXMgPSBzdmcuYXBwZW5kKFwiZ1wiKVxuICAvLyAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImZvY3VzXCIpXG4gIC8vICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpO1xuXG4gIC8vIHZhciBjb250ZXh0ID0gc3ZnLmFwcGVuZChcImdcIilcbiAgLy8gICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJjb250ZXh0XCIpXG4gIC8vICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbjIubGVmdCArIFwiLFwiICsgbWFyZ2luMi50b3AgKyBcIilcIik7XG5cbiAgLy8gZDMuanNvbignL3ByaWNlcycsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuXG4gIC8vICAgZGF0YSA9IGRhdGEucHJpY2VzLm1hcChmdW5jdGlvbihkKSB7XG4gIC8vICAgICBkLnRpbWUgPSBuZXcgRGF0ZShkLnRpbWUpO1xuICAvLyAgICAgZC5wcmljZSA9ICtkLmxhc3RQcmljZTtcbiAgLy8gICAgIHJldHVybiBkO1xuICAvLyAgIH0pXG5cbiAgLy8gICB2YXIgcHJpY2VFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAvLyAgICAgcmV0dXJuIGQubGFzdFByaWNlO1xuICAvLyAgIH0pXG5cbiAgLy8gICB2YXIgdGltZUV4dGVudCA9IGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7XG4gIC8vICAgICByZXR1cm4gZC50aW1lO1xuICAvLyAgIH0pO1xuXG4gIC8vICAgY29uc29sZS5sb2cocHJpY2VFeHRlbnQsIHRpbWVFeHRlbnQpO1xuXG4gIC8vICAgeC5kb21haW4odGltZUV4dGVudCk7XG4gIC8vICAgeS5kb21haW4ocHJpY2VFeHRlbnQpO1xuICAvLyAgIHgyLmRvbWFpbih4LmRvbWFpbigpKTtcbiAgLy8gICB5Mi5kb21haW4oeS5kb21haW4oKSk7XG5cbiAgLy8gICBmb2N1cy5hcHBlbmQoXCJwYXRoXCIpXG4gIC8vICAgICAgIC5kYXR1bShkYXRhKVxuICAvLyAgICAgICAuYXR0cihcImNsYXNzXCIsIFwibGluZVwiKVxuICAvLyAgICAgICAuYXR0cihcImRcIiwgbGluZSk7XG5cblxuICAvLyAgIGZvY3VzLmFwcGVuZChcImdcIilcbiAgLy8gICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpc1wiKVxuICAvLyAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgaGVpZ2h0ICsgXCIpXCIpXG4gIC8vICAgICAgIC5jYWxsKHhBeGlzKTtcblxuICAvLyAgIGZvY3VzLmFwcGVuZChcImdcIilcbiAgLy8gICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInkgYXhpc1wiKVxuICAvLyAgICAgICAuY2FsbCh5QXhpcyk7XG5cblxuICAvLyAgIGZvY3VzLnNlbGVjdEFsbCgnLmRvdCcpXG4gIC8vICAgICAuZGF0YShkYXRhKVxuICAvLyAgICAgLmVudGVyKCkuYXBwZW5kKCdjaXJjbGUnKVxuICAvLyAgICAgLmF0dHIoJ2NsYXNzJywgJ2RvdCcpXG4gIC8vICAgICAuYXR0cigncicsIDMuNSlcbiAgLy8gICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHtcbiAgLy8gICAgICAgcmV0dXJuIHgoZC50aW1lKTtcbiAgLy8gICAgIH0pXG4gIC8vICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7XG4gIC8vICAgICAgIHJldHVybiB5KGQucHJpY2UpO1xuICAvLyAgICAgfSk7XG5cblxuICAvLyAgIGNvbnRleHQuYXBwZW5kKFwicGF0aFwiKVxuICAvLyAgICAgICAuZGF0dW0oZGF0YSlcbiAgLy8gICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxpbmVcIilcbiAgLy8gICAgICAgLmF0dHIoXCJkXCIsIGxpbmUyKTtcblxuICAvLyAgIGNvbnRleHQuYXBwZW5kKFwiZ1wiKVxuICAvLyAgICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzXCIpXG4gIC8vICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsXCIgKyBoZWlnaHQyICsgXCIpXCIpXG4gIC8vICAgICAgIC5jYWxsKHhBeGlzMik7XG5cbiAgLy8gICBjb250ZXh0LmFwcGVuZChcImdcIilcbiAgLy8gICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYnJ1c2hcIilcbiAgLy8gICAgICAgLmNhbGwoYnJ1c2gpXG4gIC8vICAgICAuc2VsZWN0QWxsKFwicmVjdFwiKVxuICAvLyAgICAgICAuYXR0cihcInlcIiwgLTYpXG4gIC8vICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodDIgKyA3KTtcbiAgLy8gfSlcblxuXG4gIC8vIGZ1bmN0aW9uIGJydXNoZWQoKSB7XG4gIC8vICAgeC5kb21haW4oYnJ1c2guZW1wdHkoKSA/IHgyLmRvbWFpbigpIDogYnJ1c2guZXh0ZW50KCkpO1xuICAvLyAgIGZvY3VzLnNlbGVjdChcIi5saW5lXCIpLmF0dHIoXCJkXCIsIGxpbmUpO1xuICAvLyAgIGZvY3VzLnNlbGVjdChcIi54LmF4aXNcIikuY2FsbCh4QXhpcyk7XG5cbiAgLy8gICBmb2N1cy5zZWxlY3RBbGwoJy5kb3QnKVxuICAvLyAgICAgLmF0dHIoJ2N4JywgZnVuY3Rpb24oZCkge1xuICAvLyAgICAgICByZXR1cm4geChkLnRpbWUpO1xuICAvLyAgICAgfSlcbiAgLy8gICAgIC5hdHRyKCdjeScsIGZ1bmN0aW9uKGQpIHtcbiAgLy8gICAgICAgcmV0dXJuIHkoZC5sYXN0UHJpY2UpO1xuICAvLyAgICAgfSk7XG4gIC8vIH1cblxuXG5cbn0iLCIvL0FkYXB0ZWQgZnJvbSBodHRwOi8vYm9zdC5vY2tzLm9yZy9taWtlL2NoYXJ0L3RpbWUtc2VyaWVzLWNoYXJ0LmpzXG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbmZ1bmN0aW9uIGxpbmVDaGFydCgpIHtcblxuICB2YXIgbWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogNDB9O1xuICB2YXIgd2lkdGggPSA5NjBcbiAgdmFyIGhlaWdodCA9IDUwMFxuICB2YXIgeFZhbHVlID0gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFswXTsgfVxuICB2YXIgeVZhbHVlID0gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFsxXTsgfVxuICB2YXIgeCA9IGQzLnRpbWUuc2NhbGUoKS5yYW5nZShbMCwgd2lkdGhdKTtcbiAgdmFyIHkgPSBkMy5zY2FsZS5saW5lYXIoKS5yYW5nZShbaGVpZ2h0LCAwXSk7XG4gIHZhciB4U2NhbGUgPSBkMy50aW1lLnNjYWxlKCk7XG4gIHZhciB5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKTtcbiAgdmFyIHhBeGlzID0gZDMuc3ZnLmF4aXMoKS5zY2FsZSh4U2NhbGUpLm9yaWVudCgnYm90dG9tJyk7XG4gIHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKS54KFgpLnkoWSk7XG5cbiAgdmFyIGFwcGVuZFlBeGlzID0gZmFsc2U7XG4gIHZhciB5QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeVNjYWxlKS5vcmllbnQoJ2xlZnQnKVxuXG4gIHZhciBhcHBlbmREYXRhUG9pbnRzID0gZmFsc2U7XG5cbiAgdmFyIGFwcGVuZEJydXNoID0gZmFsc2U7XG4gIHZhciBicnVzaERvbWFpbjtcbiAgLy8gdmFyIGJydXNoID0gZDMuc3ZnLmJydXNoKCkueChYKS5vbignYnJ1c2gnLCBicnVzaGVkKVxuXG4gIGZ1bmN0aW9uIGNoYXJ0KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgLy8gQ29udmVydCBkYXRhIHRvIHN0YW5kYXJkIHJlcHJlc2VudGF0aW9uIGdyZWVkaWx5O1xuICAgICAgLy8gdGhpcyBpcyBuZWVkZWQgZm9yIG5vbmRldGVybWluaXN0aWMgYWNjZXNzb3JzLlxuICAgICAgZGF0YSA9IGRhdGEubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIFt4VmFsdWUuY2FsbChkYXRhLCBkLCBpKSwgeVZhbHVlLmNhbGwoZGF0YSwgZCwgaSldO1xuICAgICAgfSk7XG5cbiAgICAgIGlmKGJydXNoRG9tYWluKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGJydXNoRG9tYWluKTtcbiAgICAgICAgeFNjYWxlXG4gICAgICAgICAgLmRvbWFpbihicnVzaERvbWFpbilcbiAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHhTY2FsZVxuICAgICAgICAgIC5kb21haW4oZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFswXTsgfSkpXG4gICAgICAgICAgLnJhbmdlKFswLCB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XSk7XG4gICAgICB9XG4gICAgICB5U2NhbGVcbiAgICAgICAgLmRvbWFpbihkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzFdOyB9KSlcbiAgICAgICAgLnJhbmdlKFtoZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbSwgMF0pO1xuXG4gICAgICAvL1NlbGVjdCB0aGUgc3ZnIGVsZW1lbnQgaWYgaXQgZXhpc3RzXG4gICAgICB2YXIgc3ZnID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgnc3ZnJykuZGF0YShbZGF0YV0pO1xuXG4gICAgICAvL090aGVyd2lzZSwgY3JlYXRlIHRoZSBza2VsZXRhbCBjaGFydFxuICAgICAgdmFyIGdFbnRlciA9IHN2Zy5lbnRlcigpLmFwcGVuZCgnc3ZnJykuYXBwZW5kKCdnJyk7XG4gICAgICBnRW50ZXIuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnbGluZScpO1xuICAgICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggYXhpcycpO1xuICAgICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgYXhpcycpO1xuXG4gICAgICAvL3VwZGF0ZSB0aGUgb3V0ZXIgZGltZW5zaW9uc1xuICAgICAgc3ZnXG4gICAgICAgIC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICAgICAgLy91cGRhdGUgdGhlIGlubmVyIGRpbWVuc2lvbnNcbiAgICAgIHZhciBnID0gc3ZnLnNlbGVjdCgnZycpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKTtcblxuICAgICAgLy9BZGQgY2xpcCBwYXRoIHNvIGRhdGEgZG9lc24ndCBjcm9zcyBheGlzXG4gICAgICBzdmcuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJjbGlwUGF0aFwiKVxuICAgICAgICAgIC5hdHRyKFwiaWRcIiwgXCJjbGlwXCIpXG4gICAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpO1xuXG5cbiAgICAgIC8vdXBkYXRlIHRoZSBsaW5lIHBhdGhcbiAgICAgIGcuc2VsZWN0KCcubGluZScpXG4gICAgICAgIC5hdHRyKCdkJywgbGluZSk7XG5cblxuICAgICAgLy91cGRhdGUgdGhlIGRhdGEgcG9pbnRzXG4gICAgICBpZihhcHBlbmREYXRhUG9pbnRzID09PSB0cnVlKSB7XG5cbiAgICAgICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3BvaW50cycpO1xuXG4gICAgICAgIGcuc2VsZWN0KCdnLnBvaW50cycpXG4gICAgICAgICAgLnNlbGVjdEFsbCgnY2lyY2xlLnBvaW50JylcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAncG9pbnQnKVxuICAgICAgICAgIC5hdHRyKCdyJywgMy41KVxuXG4gICAgICAgIGcuc2VsZWN0QWxsKCdjaXJjbGUucG9pbnQnKVxuICAgICAgICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geFNjYWxlKGRbMF0pfSlcbiAgICAgICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7cmV0dXJuIHlTY2FsZShkWzFdKX0pXG4gICAgICB9XG5cbiAgICAgIC8vdXBkYXRlIHRoZSB4IGF4aXNcbiAgICAgIGcuc2VsZWN0KCcueC5heGlzJylcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIHlTY2FsZS5yYW5nZSgpWzBdICsgXCIpXCIpXG4gICAgICAgIC5jYWxsKHhBeGlzKTtcblxuICAgICAgLy91cGRhdGUgdGhlIHkgYXhpc1xuICAgICAgaWYoYXBwZW5kWUF4aXMgPT09IHRydWUpIHtcbiAgICAgICAgZy5zZWxlY3QoJy55LmF4aXMnKVxuICAgICAgICAgIC5jYWxsKHlBeGlzKTsgICAgICAgIFxuICAgICAgfVxuXG4gICAgfSlcbiAgfVxuXG5cblxuICAvLyBUaGUgeC1hY2Nlc3NvciBmb3IgdGhlIHBhdGggZ2VuZXJhdG9yOyB4U2NhbGUg4oiYIHhWYWx1ZS5cbiAgZnVuY3Rpb24gWChkKSB7XG4gICAgcmV0dXJuIHhTY2FsZShkWzBdKTtcbiAgfVxuXG4gIC8vIFRoZSB4LWFjY2Vzc29yIGZvciB0aGUgcGF0aCBnZW5lcmF0b3I7IHlTY2FsZSDiiJggeVZhbHVlLlxuICBmdW5jdGlvbiBZKGQpIHtcbiAgICByZXR1cm4geVNjYWxlKGRbMV0pO1xuICB9XG5cbiAgY2hhcnQubWFyZ2luID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1hcmdpbjtcbiAgICBtYXJnaW4gPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC53aWR0aCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB3aWR0aDtcbiAgICB3aWR0aCA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmhlaWdodCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBoZWlnaHQ7XG4gICAgaGVpZ2h0ID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4VmFsdWU7XG4gICAgeFZhbHVlID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5VmFsdWU7XG4gICAgeVZhbHVlID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuYXBwZW5kQnJ1c2ggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBicnVzaDtcbiAgICBicnVzaCA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmFwcGVuZFlBeGlzID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYnJ1c2g7XG4gICAgYXBwZW5kWUF4aXMgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5hcHBlbmREYXRhUG9pbnRzID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYnJ1c2g7XG4gICAgYXBwZW5kRGF0YVBvaW50cyA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9XG5cbiAgY2hhcnQueFNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geFNjYWxlO1xuICAgIHhTY2FsZSA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9XG5cbiAgY2hhcnQuYnJ1c2hEb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBicnVzaERvbWFpbjtcbiAgICBicnVzaERvbWFpbiA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9XG5cbiAgcmV0dXJuIGNoYXJ0O1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGluZUNoYXJ0OyIsInZhciBpbyA9IHJlcXVpcmUoJ3NvY2tldC5pby1jbGllbnQnKTtcbnZhciBzb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vbG9jYWxob3N0OjQwMDAnKTtcblxuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCdjb25uZWN0ZWQgdG8gd2Vic29ja2V0cycpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc29ja2V0O1xuXG5cbiJdfQ==
