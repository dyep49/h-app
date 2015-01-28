(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
// require('./charts.js')();
require('./websockets.js');

require('./d3-charts.js')();
},{"./d3-charts.js":2,"./websockets.js":5}],2:[function(require,module,exports){
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
},{"./linechart.js":3,"./table.js":4,"d3":"d3"}],3:[function(require,module,exports){
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
var d3 = require('d3');

// The table generation function
function tabulate(data, columns) {
    var table = d3.select(".content-container").append("table")
            .attr("style", "margin-left: 250px"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
            .text(function(column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .attr("style", "font-family: Courier") // sets the font style
            .html(function(d) { return d.value; });
    
    return table;
}

module.exports = tabulate;
},{"d3":"d3"}],5:[function(require,module,exports){
var io = require('socket.io-client');
var socket = io.connect('http://localhost:4000');

socket.on('connect', function() {
  console.log('connected to websockets');
});

module.exports = socket;



},{"socket.io-client":"socket.io-client"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvbGluZWNoYXJ0LmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3RhYmxlLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3dlYnNvY2tldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gcmVxdWlyZSgnLi9jaGFydC5qcycpKCk7XG4vLyByZXF1aXJlKCcuL2NoYXJ0cy5qcycpKCk7XG5yZXF1aXJlKCcuL3dlYnNvY2tldHMuanMnKTtcblxucmVxdWlyZSgnLi9kMy1jaGFydHMuanMnKSgpOyIsIi8vQWRhcHRlZCBmcm9tIGh0dHA6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay8xNjY3MzY3XG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG52YXIgbGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lY2hhcnQuanMnKTtcbnZhciB0YWJ1bGF0ZSA9IHJlcXVpcmUoJy4vdGFibGUuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblxuICB2YXIgd2lkdGggPSBwYXJzZUludChkMy5zZWxlY3QoJy5jb250ZW50LWNvbnRhaW5lcicpLnN0eWxlKCd3aWR0aCcpKVxuXG4gIGQzLmpzb24oJy9wcmljZXMnLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YS5wcmljZXMubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHZhciBwYXJzZWREYXR1bSA9IHt9XG4gICAgICBwYXJzZWREYXR1bS50aW1lID0gbmV3IERhdGUoZC50aW1lKTtcbiAgICAgIHBhcnNlZERhdHVtLnByaWNlID0gK2QubGFzdFByaWNlO1xuICAgICAgcmV0dXJuIHBhcnNlZERhdHVtO1xuICAgIH0pO1xuXG4gICAgdmFyIGNvbnRleHQgPSBsaW5lQ2hhcnQoKSAgICBcbiAgICAgIC54KGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC50aW1lfSlcbiAgICAgIC55KGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC5wcmljZX0pXG4gICAgICAuaGVpZ2h0KDEwMClcbiAgICAgIC53aWR0aCh3aWR0aCk7XG5cblxuICAgIHZhciBmb2N1cyA9IGxpbmVDaGFydCgpXG4gICAgICAueChmdW5jdGlvbihkKSB7cmV0dXJuIGQudGltZX0pXG4gICAgICAueShmdW5jdGlvbihkKSB7cmV0dXJuIGQucHJpY2V9KVxuICAgICAgLndpZHRoKHdpZHRoKVxuICAgICAgLm1hcmdpbih7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDMwLCBsZWZ0OiA0MH0pXG4gICAgICAuYXBwZW5kWUF4aXModHJ1ZSlcbiAgICAgIC5hcHBlbmREYXRhUG9pbnRzKHRydWUpO1xuXG5cbiAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgIGQzLnNlbGVjdCgnI2NvbnRleHQnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuY2FsbChjb250ZXh0KTtcblxuICAgIC8vQWRkaW5nIGJydXNoIHRvIHRoZSBjb250ZXh0IGNoYXJ0XG4gICAgdmFyIGJydXNoID0gZDMuc3ZnLmJydXNoKClcbiAgICAgIC54KGNvbnRleHQueFNjYWxlKCkpXG4gICAgICAub24oJ2JydXNoJywgYnJ1c2hlZCk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb250ZXh0IHN2ZycpXG4gICAgICAuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGJydXNoXCIpXG4gICAgICAuY2FsbChicnVzaClcbiAgICAgIC5zZWxlY3RBbGwoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcInlcIiwgLTYpXG4gICAgICAuYXR0cihcImhlaWdodFwiLCBjb250ZXh0LmhlaWdodCgpICsgNyk7XG5cbiAgICBmdW5jdGlvbiBicnVzaGVkKCkge1xuICAgICAgY29uc29sZS5sb2coJ2JydXNoJyk7XG4gICAgICBpZighYnJ1c2guZW1wdHkoKSkge1xuICAgICAgICBmb2N1cy5icnVzaERvbWFpbihicnVzaC5leHRlbnQoKSk7XG5cbiAgICAgICAgZDMuc2VsZWN0KCcjZm9jdXMnKVxuICAgICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAgIC5jYWxsKGZvY3VzKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL1NjYWxlIGNoYXJ0cyBvbiByZXNpemVcbiAgICBkMy5zZWxlY3Qod2luZG93KS5vbigncmVzaXplJywgcmVzaXplKVxuXG4gICAgZnVuY3Rpb24gcmVzaXplKCkge1xuICAgICAgd2lkdGggPSBwYXJzZUludChkMy5zZWxlY3QoJy5jb250ZW50LWNvbnRhaW5lcicpLnN0eWxlKCd3aWR0aCcpKVxuICAgICAgXG4gICAgICBmb2N1cy53aWR0aCh3aWR0aCk7XG4gICAgICBjb250ZXh0LndpZHRoKHdpZHRoKTtcblxuICAgICAgZDMuc2VsZWN0KCcjZm9jdXMnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoZm9jdXMpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZXh0JylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGNvbnRleHQpO1xuICAgIH1cblxuXG4gICAgdGFidWxhdGUoZGF0YSwgWyd0aW1lJywgJ3ByaWNlJ10pXG4gIH0pXG5cbn0iLCIvL0FkYXB0ZWQgZnJvbSBodHRwOi8vYm9zdC5vY2tzLm9yZy9taWtlL2NoYXJ0L3RpbWUtc2VyaWVzLWNoYXJ0LmpzXG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbmZ1bmN0aW9uIGxpbmVDaGFydCgpIHtcblxuICB2YXIgbWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogNDB9O1xuICB2YXIgd2lkdGggPSA5NjBcbiAgdmFyIGhlaWdodCA9IDUwMFxuICB2YXIgeFZhbHVlID0gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFswXTsgfVxuICB2YXIgeVZhbHVlID0gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFsxXTsgfVxuICB2YXIgeCA9IGQzLnRpbWUuc2NhbGUoKS5yYW5nZShbMCwgd2lkdGhdKTtcbiAgdmFyIHkgPSBkMy5zY2FsZS5saW5lYXIoKS5yYW5nZShbaGVpZ2h0LCAwXSk7XG4gIHZhciB4U2NhbGUgPSBkMy50aW1lLnNjYWxlKCk7XG4gIHZhciB5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKTtcbiAgdmFyIHhBeGlzID0gZDMuc3ZnLmF4aXMoKS5zY2FsZSh4U2NhbGUpLm9yaWVudCgnYm90dG9tJyk7XG4gIHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKS54KFgpLnkoWSk7XG5cbiAgdmFyIGFwcGVuZFlBeGlzID0gZmFsc2U7XG4gIHZhciB5QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeVNjYWxlKS5vcmllbnQoJ2xlZnQnKVxuXG4gIHZhciBhcHBlbmREYXRhUG9pbnRzID0gZmFsc2U7XG5cbiAgdmFyIGFwcGVuZEJydXNoID0gZmFsc2U7XG4gIHZhciBicnVzaERvbWFpbjtcbiAgLy8gdmFyIGJydXNoID0gZDMuc3ZnLmJydXNoKCkueChYKS5vbignYnJ1c2gnLCBicnVzaGVkKVxuXG4gIGZ1bmN0aW9uIGNoYXJ0KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgLy8gQ29udmVydCBkYXRhIHRvIHN0YW5kYXJkIHJlcHJlc2VudGF0aW9uIGdyZWVkaWx5O1xuICAgICAgLy8gdGhpcyBpcyBuZWVkZWQgZm9yIG5vbmRldGVybWluaXN0aWMgYWNjZXNzb3JzLlxuICAgICAgZGF0YSA9IGRhdGEubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIFt4VmFsdWUuY2FsbChkYXRhLCBkLCBpKSwgeVZhbHVlLmNhbGwoZGF0YSwgZCwgaSldO1xuICAgICAgfSk7XG5cbiAgICAgIGlmKGJydXNoRG9tYWluKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGJydXNoRG9tYWluKTtcbiAgICAgICAgeFNjYWxlXG4gICAgICAgICAgLmRvbWFpbihicnVzaERvbWFpbilcbiAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHhTY2FsZVxuICAgICAgICAgIC5kb21haW4oZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFswXTsgfSkpXG4gICAgICAgICAgLnJhbmdlKFswLCB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XSk7XG4gICAgICB9XG4gICAgICB5U2NhbGVcbiAgICAgICAgLmRvbWFpbihkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzFdOyB9KSlcbiAgICAgICAgLnJhbmdlKFtoZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbSwgMF0pO1xuXG4gICAgICAvL1NlbGVjdCB0aGUgc3ZnIGVsZW1lbnQgaWYgaXQgZXhpc3RzXG4gICAgICB2YXIgc3ZnID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgnc3ZnJykuZGF0YShbZGF0YV0pO1xuXG4gICAgICAvL090aGVyd2lzZSwgY3JlYXRlIHRoZSBza2VsZXRhbCBjaGFydFxuICAgICAgdmFyIGdFbnRlciA9IHN2Zy5lbnRlcigpLmFwcGVuZCgnc3ZnJykuYXBwZW5kKCdnJyk7XG4gICAgICBnRW50ZXIuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnbGluZScpO1xuICAgICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggYXhpcycpO1xuICAgICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgYXhpcycpO1xuXG4gICAgICAvL3VwZGF0ZSB0aGUgb3V0ZXIgZGltZW5zaW9uc1xuICAgICAgc3ZnXG4gICAgICAgIC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICAgICAgLy91cGRhdGUgdGhlIGlubmVyIGRpbWVuc2lvbnNcbiAgICAgIHZhciBnID0gc3ZnLnNlbGVjdCgnZycpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKTtcblxuICAgICAgLy9BZGQgY2xpcCBwYXRoIHNvIGRhdGEgZG9lc24ndCBjcm9zcyBheGlzXG4gICAgICBzdmcuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJjbGlwUGF0aFwiKVxuICAgICAgICAgIC5hdHRyKFwiaWRcIiwgXCJjbGlwXCIpXG4gICAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpO1xuXG5cbiAgICAgIC8vdXBkYXRlIHRoZSBsaW5lIHBhdGhcbiAgICAgIGcuc2VsZWN0KCcubGluZScpXG4gICAgICAgIC5hdHRyKCdkJywgbGluZSk7XG5cblxuICAgICAgLy91cGRhdGUgdGhlIGRhdGEgcG9pbnRzXG4gICAgICBpZihhcHBlbmREYXRhUG9pbnRzID09PSB0cnVlKSB7XG5cbiAgICAgICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3BvaW50cycpO1xuXG4gICAgICAgIGcuc2VsZWN0KCdnLnBvaW50cycpXG4gICAgICAgICAgLnNlbGVjdEFsbCgnY2lyY2xlLnBvaW50JylcbiAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCAncG9pbnQnKVxuICAgICAgICAgIC5hdHRyKCdyJywgMy41KVxuXG4gICAgICAgIGcuc2VsZWN0QWxsKCdjaXJjbGUucG9pbnQnKVxuICAgICAgICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geFNjYWxlKGRbMF0pfSlcbiAgICAgICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7cmV0dXJuIHlTY2FsZShkWzFdKX0pXG4gICAgICB9XG5cbiAgICAgIC8vdXBkYXRlIHRoZSB4IGF4aXNcbiAgICAgIGcuc2VsZWN0KCcueC5heGlzJylcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIHlTY2FsZS5yYW5nZSgpWzBdICsgXCIpXCIpXG4gICAgICAgIC5jYWxsKHhBeGlzKTtcblxuICAgICAgLy91cGRhdGUgdGhlIHkgYXhpc1xuICAgICAgaWYoYXBwZW5kWUF4aXMgPT09IHRydWUpIHtcbiAgICAgICAgZy5zZWxlY3QoJy55LmF4aXMnKVxuICAgICAgICAgIC5jYWxsKHlBeGlzKTsgICAgICAgIFxuICAgICAgfVxuXG4gICAgfSlcbiAgfVxuXG5cblxuICAvLyBUaGUgeC1hY2Nlc3NvciBmb3IgdGhlIHBhdGggZ2VuZXJhdG9yOyB4U2NhbGUg4oiYIHhWYWx1ZS5cbiAgZnVuY3Rpb24gWChkKSB7XG4gICAgcmV0dXJuIHhTY2FsZShkWzBdKTtcbiAgfVxuXG4gIC8vIFRoZSB4LWFjY2Vzc29yIGZvciB0aGUgcGF0aCBnZW5lcmF0b3I7IHlTY2FsZSDiiJggeVZhbHVlLlxuICBmdW5jdGlvbiBZKGQpIHtcbiAgICByZXR1cm4geVNjYWxlKGRbMV0pO1xuICB9XG5cbiAgY2hhcnQubWFyZ2luID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1hcmdpbjtcbiAgICBtYXJnaW4gPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC53aWR0aCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB3aWR0aDtcbiAgICB3aWR0aCA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmhlaWdodCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBoZWlnaHQ7XG4gICAgaGVpZ2h0ID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4VmFsdWU7XG4gICAgeFZhbHVlID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5VmFsdWU7XG4gICAgeVZhbHVlID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuYXBwZW5kQnJ1c2ggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBicnVzaDtcbiAgICBicnVzaCA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmFwcGVuZFlBeGlzID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYnJ1c2g7XG4gICAgYXBwZW5kWUF4aXMgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5hcHBlbmREYXRhUG9pbnRzID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYnJ1c2g7XG4gICAgYXBwZW5kRGF0YVBvaW50cyA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9XG5cbiAgY2hhcnQueFNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geFNjYWxlO1xuICAgIHhTY2FsZSA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9XG5cbiAgY2hhcnQuYnJ1c2hEb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBicnVzaERvbWFpbjtcbiAgICBicnVzaERvbWFpbiA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9XG5cbiAgcmV0dXJuIGNoYXJ0O1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGluZUNoYXJ0OyIsInZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbi8vIFRoZSB0YWJsZSBnZW5lcmF0aW9uIGZ1bmN0aW9uXG5mdW5jdGlvbiB0YWJ1bGF0ZShkYXRhLCBjb2x1bW5zKSB7XG4gICAgdmFyIHRhYmxlID0gZDMuc2VsZWN0KFwiLmNvbnRlbnQtY29udGFpbmVyXCIpLmFwcGVuZChcInRhYmxlXCIpXG4gICAgICAgICAgICAuYXR0cihcInN0eWxlXCIsIFwibWFyZ2luLWxlZnQ6IDI1MHB4XCIpLFxuICAgICAgICB0aGVhZCA9IHRhYmxlLmFwcGVuZChcInRoZWFkXCIpLFxuICAgICAgICB0Ym9keSA9IHRhYmxlLmFwcGVuZChcInRib2R5XCIpO1xuXG4gICAgLy8gYXBwZW5kIHRoZSBoZWFkZXIgcm93XG4gICAgdGhlYWQuYXBwZW5kKFwidHJcIilcbiAgICAgICAgLnNlbGVjdEFsbChcInRoXCIpXG4gICAgICAgIC5kYXRhKGNvbHVtbnMpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoXCJ0aFwiKVxuICAgICAgICAgICAgLnRleHQoZnVuY3Rpb24oY29sdW1uKSB7IHJldHVybiBjb2x1bW47IH0pO1xuXG4gICAgLy8gY3JlYXRlIGEgcm93IGZvciBlYWNoIG9iamVjdCBpbiB0aGUgZGF0YVxuICAgIHZhciByb3dzID0gdGJvZHkuc2VsZWN0QWxsKFwidHJcIilcbiAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZChcInRyXCIpO1xuXG4gICAgLy8gY3JlYXRlIGEgY2VsbCBpbiBlYWNoIHJvdyBmb3IgZWFjaCBjb2x1bW5cbiAgICB2YXIgY2VsbHMgPSByb3dzLnNlbGVjdEFsbChcInRkXCIpXG4gICAgICAgIC5kYXRhKGZ1bmN0aW9uKHJvdykge1xuICAgICAgICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7Y29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXX07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZChcInRkXCIpXG4gICAgICAgIC5hdHRyKFwic3R5bGVcIiwgXCJmb250LWZhbWlseTogQ291cmllclwiKSAvLyBzZXRzIHRoZSBmb250IHN0eWxlXG4gICAgICAgICAgICAuaHRtbChmdW5jdGlvbihkKSB7IHJldHVybiBkLnZhbHVlOyB9KTtcbiAgICBcbiAgICByZXR1cm4gdGFibGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGFidWxhdGU7IiwidmFyIGlvID0gcmVxdWlyZSgnc29ja2V0LmlvLWNsaWVudCcpO1xudmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuXG5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byB3ZWJzb2NrZXRzJyk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzb2NrZXQ7XG5cblxuIl19
