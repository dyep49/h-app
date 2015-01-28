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
      .attr("height", context.height() + 7)
      .attr('transform', 'translate(' + context.margin().left + ',0)');

    var dataTable = tabulate()

    d3.select('#data-table')
      .datum(data)
      .call(dataTable);



    function brushed() {
      if(!brush.empty()) {
        focus.brushDomain(brush.extent());

        d3.select('#focus')
          .datum(data)
          .call(focus);

        d3.select('table').remove();

        var brushedData = data.filter(function(datum) {
          var timeMin = brush.extent()[0];
          var timeMax = brush.extent()[1];
          return datum.time >= timeMin && datum.time <= timeMax
        }) 


        d3.select('#data-table')
          .datum(brushedData)
          .call(dataTable);
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

function tabulate() {

  function capitalize(string) {
    return string.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  }

  function table(selection) {
    selection.each(function(data) {

      //Create array of columns from data keys
      var columns = []
      var dataSample = data[0];

      for(key in dataSample) {
        columns.push(key);
      }

      //Create array of data
      cellData = data.map(function(row) {
        return columns.map(function(column) {
          return {column: column, value: row[column]}
        })
      })

      //Select the svg element if it exists
      var table = d3.select(this).selectAll('table').data([data]);

      var tEnter = table.enter().append('table');
      var thead = tEnter.append('thead');
      var tbody = tEnter.append('tbody');


      //Append header row
      thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function(column) {return capitalize(column);});


      //Create Rows
      var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

      //Create cells in each row for each column
      var cells = rows.selectAll('td')
        .data(function(row) {
          return columns.map(function(column) {
            return {column: column, value: row[column]}
          })
        })
        .enter()
        .append('td')
        .html(function(d) { return d.value });
    })

  }

  return table
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvbGluZWNoYXJ0LmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3RhYmxlLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3dlYnNvY2tldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gcmVxdWlyZSgnLi9jaGFydC5qcycpKCk7XG4vLyByZXF1aXJlKCcuL2NoYXJ0cy5qcycpKCk7XG5yZXF1aXJlKCcuL3dlYnNvY2tldHMuanMnKTtcblxucmVxdWlyZSgnLi9kMy1jaGFydHMuanMnKSgpOyIsIi8vQWRhcHRlZCBmcm9tIGh0dHA6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay8xNjY3MzY3XG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG52YXIgbGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lY2hhcnQuanMnKTtcbnZhciB0YWJ1bGF0ZSA9IHJlcXVpcmUoJy4vdGFibGUuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblxuICB2YXIgd2lkdGggPSBwYXJzZUludChkMy5zZWxlY3QoJy5jb250ZW50LWNvbnRhaW5lcicpLnN0eWxlKCd3aWR0aCcpKVxuXG4gIGQzLmpzb24oJy9wcmljZXMnLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YS5wcmljZXMubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHZhciBwYXJzZWREYXR1bSA9IHt9XG4gICAgICBwYXJzZWREYXR1bS50aW1lID0gbmV3IERhdGUoZC50aW1lKTtcbiAgICAgIHBhcnNlZERhdHVtLnByaWNlID0gK2QubGFzdFByaWNlO1xuICAgICAgcmV0dXJuIHBhcnNlZERhdHVtO1xuICAgIH0pO1xuXG4gICAgdmFyIGNvbnRleHQgPSBsaW5lQ2hhcnQoKSAgICBcbiAgICAgIC54KGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC50aW1lfSlcbiAgICAgIC55KGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC5wcmljZX0pXG4gICAgICAuaGVpZ2h0KDEwMClcbiAgICAgIC53aWR0aCh3aWR0aCk7XG5cblxuICAgIHZhciBmb2N1cyA9IGxpbmVDaGFydCgpXG4gICAgICAueChmdW5jdGlvbihkKSB7cmV0dXJuIGQudGltZX0pXG4gICAgICAueShmdW5jdGlvbihkKSB7cmV0dXJuIGQucHJpY2V9KVxuICAgICAgLndpZHRoKHdpZHRoKVxuICAgICAgLm1hcmdpbih7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDMwLCBsZWZ0OiA0MH0pXG4gICAgICAuYXBwZW5kWUF4aXModHJ1ZSlcbiAgICAgIC5hcHBlbmREYXRhUG9pbnRzKHRydWUpO1xuXG5cbiAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgIGQzLnNlbGVjdCgnI2NvbnRleHQnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuY2FsbChjb250ZXh0KTtcblxuICAgIC8vQWRkaW5nIGJydXNoIHRvIHRoZSBjb250ZXh0IGNoYXJ0XG4gICAgdmFyIGJydXNoID0gZDMuc3ZnLmJydXNoKClcbiAgICAgIC54KGNvbnRleHQueFNjYWxlKCkpXG4gICAgICAub24oJ2JydXNoJywgYnJ1c2hlZCk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb250ZXh0IHN2ZycpXG4gICAgICAuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGJydXNoXCIpXG4gICAgICAuY2FsbChicnVzaClcbiAgICAgIC5zZWxlY3RBbGwoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcInlcIiwgLTYpXG4gICAgICAuYXR0cihcImhlaWdodFwiLCBjb250ZXh0LmhlaWdodCgpICsgNylcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb250ZXh0Lm1hcmdpbigpLmxlZnQgKyAnLDApJyk7XG5cbiAgICB2YXIgZGF0YVRhYmxlID0gdGFidWxhdGUoKVxuXG4gICAgZDMuc2VsZWN0KCcjZGF0YS10YWJsZScpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGRhdGFUYWJsZSk7XG5cblxuXG4gICAgZnVuY3Rpb24gYnJ1c2hlZCgpIHtcbiAgICAgIGlmKCFicnVzaC5lbXB0eSgpKSB7XG4gICAgICAgIGZvY3VzLmJydXNoRG9tYWluKGJydXNoLmV4dGVudCgpKTtcblxuICAgICAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgICAgLmNhbGwoZm9jdXMpO1xuXG4gICAgICAgIGQzLnNlbGVjdCgndGFibGUnKS5yZW1vdmUoKTtcblxuICAgICAgICB2YXIgYnJ1c2hlZERhdGEgPSBkYXRhLmZpbHRlcihmdW5jdGlvbihkYXR1bSkge1xuICAgICAgICAgIHZhciB0aW1lTWluID0gYnJ1c2guZXh0ZW50KClbMF07XG4gICAgICAgICAgdmFyIHRpbWVNYXggPSBicnVzaC5leHRlbnQoKVsxXTtcbiAgICAgICAgICByZXR1cm4gZGF0dW0udGltZSA+PSB0aW1lTWluICYmIGRhdHVtLnRpbWUgPD0gdGltZU1heFxuICAgICAgICB9KSBcblxuXG4gICAgICAgIGQzLnNlbGVjdCgnI2RhdGEtdGFibGUnKVxuICAgICAgICAgIC5kYXR1bShicnVzaGVkRGF0YSlcbiAgICAgICAgICAuY2FsbChkYXRhVGFibGUpO1xuICAgICAgfVxuICAgIH1cblxuXG5cbiAgICAvL1NjYWxlIGNoYXJ0cyBvbiByZXNpemVcbiAgICBkMy5zZWxlY3Qod2luZG93KS5vbigncmVzaXplJywgcmVzaXplKVxuXG4gICAgZnVuY3Rpb24gcmVzaXplKCkge1xuICAgICAgd2lkdGggPSBwYXJzZUludChkMy5zZWxlY3QoJy5jb250ZW50LWNvbnRhaW5lcicpLnN0eWxlKCd3aWR0aCcpKVxuICAgICAgXG4gICAgICBmb2N1cy53aWR0aCh3aWR0aCk7XG4gICAgICBjb250ZXh0LndpZHRoKHdpZHRoKTtcblxuICAgICAgZDMuc2VsZWN0KCcjZm9jdXMnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoZm9jdXMpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZXh0JylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGNvbnRleHQpO1xuICAgIH1cblxuICB9KVxuXG59IiwiLy9BZGFwdGVkIGZyb20gaHR0cDovL2Jvc3Qub2Nrcy5vcmcvbWlrZS9jaGFydC90aW1lLXNlcmllcy1jaGFydC5qc1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuXG5mdW5jdGlvbiBsaW5lQ2hhcnQoKSB7XG5cbiAgdmFyIG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMjAsIGxlZnQ6IDQwfTtcbiAgdmFyIHdpZHRoID0gOTYwXG4gIHZhciBoZWlnaHQgPSA1MDBcbiAgdmFyIHhWYWx1ZSA9IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbMF07IH1cbiAgdmFyIHlWYWx1ZSA9IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbMV07IH1cbiAgdmFyIHggPSBkMy50aW1lLnNjYWxlKCkucmFuZ2UoWzAsIHdpZHRoXSk7XG4gIHZhciB5ID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoW2hlaWdodCwgMF0pO1xuICB2YXIgeFNjYWxlID0gZDMudGltZS5zY2FsZSgpO1xuICB2YXIgeVNjYWxlID0gZDMuc2NhbGUubGluZWFyKCk7XG4gIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeFNjYWxlKS5vcmllbnQoJ2JvdHRvbScpO1xuICB2YXIgbGluZSA9IGQzLnN2Zy5saW5lKCkueChYKS55KFkpO1xuXG4gIHZhciBhcHBlbmRZQXhpcyA9IGZhbHNlO1xuICB2YXIgeUF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHlTY2FsZSkub3JpZW50KCdsZWZ0JylcblxuICB2YXIgYXBwZW5kRGF0YVBvaW50cyA9IGZhbHNlO1xuXG4gIHZhciBhcHBlbmRCcnVzaCA9IGZhbHNlO1xuICB2YXIgYnJ1c2hEb21haW47XG4gIC8vIHZhciBicnVzaCA9IGQzLnN2Zy5icnVzaCgpLngoWCkub24oJ2JydXNoJywgYnJ1c2hlZClcblxuICBmdW5jdGlvbiBjaGFydChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgIC8vIENvbnZlcnQgZGF0YSB0byBzdGFuZGFyZCByZXByZXNlbnRhdGlvbiBncmVlZGlseTtcbiAgICAgIC8vIHRoaXMgaXMgbmVlZGVkIGZvciBub25kZXRlcm1pbmlzdGljIGFjY2Vzc29ycy5cbiAgICAgIGRhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHJldHVybiBbeFZhbHVlLmNhbGwoZGF0YSwgZCwgaSksIHlWYWx1ZS5jYWxsKGRhdGEsIGQsIGkpXTtcbiAgICAgIH0pO1xuXG4gICAgICBpZihicnVzaERvbWFpbikge1xuICAgICAgICB4U2NhbGVcbiAgICAgICAgICAuZG9tYWluKGJydXNoRG9tYWluKVxuICAgICAgICAgIC5yYW5nZShbMCwgd2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeFNjYWxlXG4gICAgICAgICAgLmRvbWFpbihkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzBdOyB9KSlcbiAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKTtcbiAgICAgIH1cbiAgICAgIHlTY2FsZVxuICAgICAgICAuZG9tYWluKGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7cmV0dXJuIGRbMV07IH0pKVxuICAgICAgICAucmFuZ2UoW2hlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tLCAwXSk7XG5cbiAgICAgIC8vU2VsZWN0IHRoZSBzdmcgZWxlbWVudCBpZiBpdCBleGlzdHNcbiAgICAgIHZhciBzdmcgPSBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCdzdmcnKS5kYXRhKFtkYXRhXSk7XG5cbiAgICAgIC8vT3RoZXJ3aXNlLCBjcmVhdGUgdGhlIHNrZWxldGFsIGNoYXJ0XG4gICAgICB2YXIgZ0VudGVyID0gc3ZnLmVudGVyKCkuYXBwZW5kKCdzdmcnKS5hcHBlbmQoJ2cnKTtcbiAgICAgIGdFbnRlci5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdsaW5lJyk7XG4gICAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneCBheGlzJyk7XG4gICAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneSBheGlzJyk7XG5cbiAgICAgIC8vdXBkYXRlIHRoZSBvdXRlciBkaW1lbnNpb25zXG4gICAgICBzdmdcbiAgICAgICAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gICAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpO1xuXG4gICAgICAvL3VwZGF0ZSB0aGUgaW5uZXIgZGltZW5zaW9uc1xuICAgICAgdmFyIGcgPSBzdmcuc2VsZWN0KCdnJylcbiAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpO1xuXG4gICAgICAvL0FkZCBjbGlwIHBhdGggc28gZGF0YSBkb2Vzbid0IGNyb3NzIGF4aXNcbiAgICAgIHN2Zy5hcHBlbmQoXCJkZWZzXCIpLmFwcGVuZChcImNsaXBQYXRoXCIpXG4gICAgICAgICAgLmF0dHIoXCJpZFwiLCBcImNsaXBcIilcbiAgICAgICAgLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG5cblxuICAgICAgLy91cGRhdGUgdGhlIGxpbmUgcGF0aFxuICAgICAgZy5zZWxlY3QoJy5saW5lJylcbiAgICAgICAgLmF0dHIoJ2QnLCBsaW5lKTtcblxuXG4gICAgICAvL3VwZGF0ZSB0aGUgZGF0YSBwb2ludHNcbiAgICAgIGlmKGFwcGVuZERhdGFQb2ludHMgPT09IHRydWUpIHtcblxuICAgICAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAncG9pbnRzJyk7XG5cbiAgICAgICAgZy5zZWxlY3QoJ2cucG9pbnRzJylcbiAgICAgICAgICAuc2VsZWN0QWxsKCdjaXJjbGUucG9pbnQnKVxuICAgICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdwb2ludCcpXG4gICAgICAgICAgLmF0dHIoJ3InLCAzLjUpXG5cbiAgICAgICAgZy5zZWxlY3RBbGwoJ2NpcmNsZS5wb2ludCcpXG4gICAgICAgICAgLmF0dHIoJ2N4JywgZnVuY3Rpb24oZCkge3JldHVybiB4U2NhbGUoZFswXSl9KVxuICAgICAgICAgIC5hdHRyKCdjeScsIGZ1bmN0aW9uKGQpIHtyZXR1cm4geVNjYWxlKGRbMV0pfSlcbiAgICAgIH1cblxuICAgICAgLy91cGRhdGUgdGhlIHggYXhpc1xuICAgICAgZy5zZWxlY3QoJy54LmF4aXMnKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgeVNjYWxlLnJhbmdlKClbMF0gKyBcIilcIilcbiAgICAgICAgLmNhbGwoeEF4aXMpO1xuXG4gICAgICAvL3VwZGF0ZSB0aGUgeSBheGlzXG4gICAgICBpZihhcHBlbmRZQXhpcyA9PT0gdHJ1ZSkge1xuICAgICAgICBnLnNlbGVjdCgnLnkuYXhpcycpXG4gICAgICAgICAgLmNhbGwoeUF4aXMpOyAgICAgICAgXG4gICAgICB9XG5cbiAgICB9KVxuICB9XG5cblxuXG4gIC8vIFRoZSB4LWFjY2Vzc29yIGZvciB0aGUgcGF0aCBnZW5lcmF0b3I7IHhTY2FsZSDiiJggeFZhbHVlLlxuICBmdW5jdGlvbiBYKGQpIHtcbiAgICByZXR1cm4geFNjYWxlKGRbMF0pO1xuICB9XG5cbiAgLy8gVGhlIHgtYWNjZXNzb3IgZm9yIHRoZSBwYXRoIGdlbmVyYXRvcjsgeVNjYWxlIOKImCB5VmFsdWUuXG4gIGZ1bmN0aW9uIFkoZCkge1xuICAgIHJldHVybiB5U2NhbGUoZFsxXSk7XG4gIH1cblxuICBjaGFydC5tYXJnaW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbWFyZ2luO1xuICAgIG1hcmdpbiA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LndpZHRoID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHdpZHRoO1xuICAgIHdpZHRoID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuaGVpZ2h0ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGhlaWdodDtcbiAgICBoZWlnaHQgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC54ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHhWYWx1ZTtcbiAgICB4VmFsdWUgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC55ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHlWYWx1ZTtcbiAgICB5VmFsdWUgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5hcHBlbmRCcnVzaCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJydXNoO1xuICAgIGJydXNoID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuYXBwZW5kWUF4aXMgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBicnVzaDtcbiAgICBhcHBlbmRZQXhpcyA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmFwcGVuZERhdGFQb2ludHMgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBicnVzaDtcbiAgICBhcHBlbmREYXRhUG9pbnRzID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH1cblxuICBjaGFydC54U2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4U2NhbGU7XG4gICAgeFNjYWxlID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH1cblxuICBjaGFydC5icnVzaERvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJydXNoRG9tYWluO1xuICAgIGJydXNoRG9tYWluID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH1cblxuICByZXR1cm4gY2hhcnQ7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaW5lQ2hhcnQ7IiwidmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcblxuZnVuY3Rpb24gdGFidWxhdGUoKSB7XG5cbiAgZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyg/Ol58XFxzKVxcUy9nLCBmdW5jdGlvbihhKSB7IHJldHVybiBhLnRvVXBwZXJDYXNlKCk7IH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFibGUoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAvL0NyZWF0ZSBhcnJheSBvZiBjb2x1bW5zIGZyb20gZGF0YSBrZXlzXG4gICAgICB2YXIgY29sdW1ucyA9IFtdXG4gICAgICB2YXIgZGF0YVNhbXBsZSA9IGRhdGFbMF07XG5cbiAgICAgIGZvcihrZXkgaW4gZGF0YVNhbXBsZSkge1xuICAgICAgICBjb2x1bW5zLnB1c2goa2V5KTtcbiAgICAgIH1cblxuICAgICAgLy9DcmVhdGUgYXJyYXkgb2YgZGF0YVxuICAgICAgY2VsbERhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICAgIHJldHVybiB7Y29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXX1cbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIC8vU2VsZWN0IHRoZSBzdmcgZWxlbWVudCBpZiBpdCBleGlzdHNcbiAgICAgIHZhciB0YWJsZSA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RhYmxlJykuZGF0YShbZGF0YV0pO1xuXG4gICAgICB2YXIgdEVudGVyID0gdGFibGUuZW50ZXIoKS5hcHBlbmQoJ3RhYmxlJyk7XG4gICAgICB2YXIgdGhlYWQgPSB0RW50ZXIuYXBwZW5kKCd0aGVhZCcpO1xuICAgICAgdmFyIHRib2R5ID0gdEVudGVyLmFwcGVuZCgndGJvZHknKTtcblxuXG4gICAgICAvL0FwcGVuZCBoZWFkZXIgcm93XG4gICAgICB0aGVhZC5hcHBlbmQoJ3RyJylcbiAgICAgICAgLnNlbGVjdEFsbCgndGgnKVxuICAgICAgICAuZGF0YShjb2x1bW5zKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0aCcpXG4gICAgICAgIC50ZXh0KGZ1bmN0aW9uKGNvbHVtbikge3JldHVybiBjYXBpdGFsaXplKGNvbHVtbik7fSk7XG5cblxuICAgICAgLy9DcmVhdGUgUm93c1xuICAgICAgdmFyIHJvd3MgPSB0Ym9keS5zZWxlY3RBbGwoJ3RyJylcbiAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgndHInKTtcblxuICAgICAgLy9DcmVhdGUgY2VsbHMgaW4gZWFjaCByb3cgZm9yIGVhY2ggY29sdW1uXG4gICAgICB2YXIgY2VsbHMgPSByb3dzLnNlbGVjdEFsbCgndGQnKVxuICAgICAgICAuZGF0YShmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm4ge2NvbHVtbjogY29sdW1uLCB2YWx1ZTogcm93W2NvbHVtbl19XG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgndGQnKVxuICAgICAgICAuaHRtbChmdW5jdGlvbihkKSB7IHJldHVybiBkLnZhbHVlIH0pO1xuICAgIH0pXG5cbiAgfVxuXG4gIHJldHVybiB0YWJsZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRhYnVsYXRlO1xuXG5cbiIsInZhciBpbyA9IHJlcXVpcmUoJ3NvY2tldC5pby1jbGllbnQnKTtcbnZhciBzb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vbG9jYWxob3N0OjQwMDAnKTtcblxuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCdjb25uZWN0ZWQgdG8gd2Vic29ja2V0cycpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc29ja2V0O1xuXG5cbiJdfQ==
