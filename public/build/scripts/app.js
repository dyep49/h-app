(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
// require('./charts.js')();
require('./d3-charts.js')();
},{"./d3-charts.js":2}],2:[function(require,module,exports){
//Adapted from http://bl.ocks.org/mbostock/1667367
'use strict';

var d3 = require('d3');
var lineChart = require('./linechart.js');
var tabulate = require('./table.js');
var io = require('./websockets.js');



module.exports = function() {

  var width = parseInt(d3.select('.content-container').style('width'));

  function parsePrice(price) {
    var parsedPrice = {};
    parsedPrice.time = new Date(price.time);
    parsedPrice.price = +price.lastPrice;

    return parsedPrice;
  }

  d3.json('/prices', function(err, data) {
    data = data.prices.map(parsePrice);

    io.on('price', function(price) {
      var newPrice = parsePrice(price);

      if(JSON.stringify(newPrice) !== JSON.stringify(data[data.length - 1])) {
        data.push(newPrice);
        update();        
      }

    });

    var context = lineChart()    
      .x(function(d) { return d.time; })
      .y(function(d) { return d.price; })
      .yPadding(0.01)
      .height(100)
      .width(width);


    var focus = lineChart()
      .x(function(d) { return d.time; })
      .y(function(d) { return d.price; })
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

    var dataTable = tabulate();

    d3.select('#data-table')
      .datum(data)
      .call(dataTable);




    function filterDataByDateRange(data, extent) {
        var timeMin = extent[0];
        var timeMax = extent[1];

        return data.filter(function(datum) {
          var timeMin = brush.extent()[0];
          var timeMax = brush.extent()[1];
          return datum.time >= timeMin && datum.time <= timeMax;
        });
    }

    function brushed() {
      var focusDomain;
      var filteredData;

      if(!brush.empty()) {
        focusDomain = brush.extent();
        filteredData = filterDataByDateRange(data, focusDomain);
      } else {
        focusDomain = d3.extent(data, function(d) {return d.time;});
        filteredData = data;
      } 

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
},{"./linechart.js":3,"./table.js":4,"./websockets.js":5,"d3":"d3"}],3:[function(require,module,exports){
//Adapted from http://bost.ocks.org/mike/chart/time-series-chart.js
'use strict';

var d3 = require('d3');

function lineChart() {

  var margin = {top: 10, right: 10, bottom: 20, left: 40};
  var width = 960;
  var height = 500;
  var xValue = function(d) { return d[0]; };
  var yValue = function(d) { return d[1]; };
  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);
  var xScale = d3.time.scale();
  var yScale = d3.scale.linear();
  var xAxis = d3.svg.axis().scale(xScale).orient('bottom');
  var line = d3.svg.line().x(X).y(Y);

  var yPadding = 0.025;

  var appendYAxis = false;
  var yAxis = d3.svg.axis().scale(yScale).orient('left');

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

      var yExtent = d3.extent(data, function(d) {return d[1]; });
      var yMin = yExtent[0] * (1 - yPadding);
      var yMax = yExtent[1] * (1 + yPadding);

      yScale
        .domain([yMin, yMax])
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

      //update the x axis
      g.select('.x.axis')
        .attr("transform", "translate(0," + yScale.range()[0] + ")")
        .call(xAxis);

      //update the y axis
      if(appendYAxis === true) {
        g.select('.y.axis')
          .call(yAxis);        
      }

      //update the data points
      if(appendDataPoints === true) {

        gEnter.append('g').attr('class', 'points');

        g.select('g.points')
          .selectAll('circle.point')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'point')
          .attr('r', 3.5);

        g.selectAll('circle.point')
          .attr('cx', function(d) { return xScale(d[0]); })
          .attr('cy', function(d) { return yScale(d[1]); });
      }

    });
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

  chart.appendYAxis = function(_) {
    if(!arguments.length) return appendYAxis;
    appendYAxis = _;
    return chart;
  };

  chart.appendDataPoints = function(_) {
    if(!arguments.length) return appendDataPoints;
    appendDataPoints = _;
    return chart;
  };

  chart.xScale = function(_) {
    if(!arguments.length) return xScale;
    xScale = _;
    return chart;
  };

  chart.brushDomain = function(_) {
    if(!arguments.length) return brushDomain;
    brushDomain = _;
    return chart;
  };

  chart.yPadding = function(_) {
    if(!arguments.length) return yPadding;
    yPadding = _;
    return chart;
  };

  return chart;

}

module.exports = lineChart;
},{"d3":"d3"}],4:[function(require,module,exports){
'use strict';

var d3 = require('d3');

function tabulate() {

  function capitalize(string) {
    return string.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  }

  function table(selection) {
    selection.each(function(data) {

      //Create array of columns from data keys
      var columns = [];
      var dataSample = data[0];

      for(var key in dataSample) {
        columns.push(key);
      }

      //Create array of data
      var cellData = data.map(function(row) {
        return columns.map(function(column) {
          return {column: column, value: row[column]};
        });
      });

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
            return {column: column, value: row[column]};
          });
        })
        .enter()
        .append('td')
        .html(function(d) { return d.value; });
    });

  }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvbGluZWNoYXJ0LmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3RhYmxlLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3dlYnNvY2tldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHJlcXVpcmUoJy4vY2hhcnQuanMnKSgpO1xuLy8gcmVxdWlyZSgnLi9jaGFydHMuanMnKSgpO1xucmVxdWlyZSgnLi9kMy1jaGFydHMuanMnKSgpOyIsIi8vQWRhcHRlZCBmcm9tIGh0dHA6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay8xNjY3MzY3XG4ndXNlIHN0cmljdCc7XG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG52YXIgbGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lY2hhcnQuanMnKTtcbnZhciB0YWJ1bGF0ZSA9IHJlcXVpcmUoJy4vdGFibGUuanMnKTtcbnZhciBpbyA9IHJlcXVpcmUoJy4vd2Vic29ja2V0cy5qcycpO1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblxuICB2YXIgd2lkdGggPSBwYXJzZUludChkMy5zZWxlY3QoJy5jb250ZW50LWNvbnRhaW5lcicpLnN0eWxlKCd3aWR0aCcpKTtcblxuICBmdW5jdGlvbiBwYXJzZVByaWNlKHByaWNlKSB7XG4gICAgdmFyIHBhcnNlZFByaWNlID0ge307XG4gICAgcGFyc2VkUHJpY2UudGltZSA9IG5ldyBEYXRlKHByaWNlLnRpbWUpO1xuICAgIHBhcnNlZFByaWNlLnByaWNlID0gK3ByaWNlLmxhc3RQcmljZTtcblxuICAgIHJldHVybiBwYXJzZWRQcmljZTtcbiAgfVxuXG4gIGQzLmpzb24oJy9wcmljZXMnLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YS5wcmljZXMubWFwKHBhcnNlUHJpY2UpO1xuXG4gICAgaW8ub24oJ3ByaWNlJywgZnVuY3Rpb24ocHJpY2UpIHtcbiAgICAgIHZhciBuZXdQcmljZSA9IHBhcnNlUHJpY2UocHJpY2UpO1xuXG4gICAgICBpZihKU09OLnN0cmluZ2lmeShuZXdQcmljZSkgIT09IEpTT04uc3RyaW5naWZ5KGRhdGFbZGF0YS5sZW5ndGggLSAxXSkpIHtcbiAgICAgICAgZGF0YS5wdXNoKG5ld1ByaWNlKTtcbiAgICAgICAgdXBkYXRlKCk7ICAgICAgICBcbiAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgdmFyIGNvbnRleHQgPSBsaW5lQ2hhcnQoKSAgICBcbiAgICAgIC54KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGltZTsgfSlcbiAgICAgIC55KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQucHJpY2U7IH0pXG4gICAgICAueVBhZGRpbmcoMC4wMSlcbiAgICAgIC5oZWlnaHQoMTAwKVxuICAgICAgLndpZHRoKHdpZHRoKTtcblxuXG4gICAgdmFyIGZvY3VzID0gbGluZUNoYXJ0KClcbiAgICAgIC54KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGltZTsgfSlcbiAgICAgIC55KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQucHJpY2U7IH0pXG4gICAgICAud2lkdGgod2lkdGgpXG4gICAgICAubWFyZ2luKHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMzAsIGxlZnQ6IDQwfSlcbiAgICAgIC5hcHBlbmRZQXhpcyh0cnVlKVxuICAgICAgLmFwcGVuZERhdGFQb2ludHModHJ1ZSk7XG5cblxuICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgLmNhbGwoZm9jdXMpO1xuXG4gICAgZDMuc2VsZWN0KCcjY29udGV4dCcpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGNvbnRleHQpO1xuXG4gICAgLy9BZGRpbmcgYnJ1c2ggdG8gdGhlIGNvbnRleHQgY2hhcnRcbiAgICB2YXIgYnJ1c2ggPSBkMy5zdmcuYnJ1c2goKVxuICAgICAgLngoY29udGV4dC54U2NhbGUoKSlcbiAgICAgIC5vbignYnJ1c2gnLCBicnVzaGVkKTtcblxuICAgIGQzLnNlbGVjdCgnI2NvbnRleHQgc3ZnJylcbiAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYnJ1c2hcIilcbiAgICAgIC5jYWxsKGJydXNoKVxuICAgICAgLnNlbGVjdEFsbChcInJlY3RcIilcbiAgICAgIC5hdHRyKFwieVwiLCAtNilcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGNvbnRleHQuaGVpZ2h0KCkgKyA3KVxuICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbnRleHQubWFyZ2luKCkubGVmdCArICcsMCknKTtcblxuICAgIHZhciBkYXRhVGFibGUgPSB0YWJ1bGF0ZSgpO1xuXG4gICAgZDMuc2VsZWN0KCcjZGF0YS10YWJsZScpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGRhdGFUYWJsZSk7XG5cblxuXG5cbiAgICBmdW5jdGlvbiBmaWx0ZXJEYXRhQnlEYXRlUmFuZ2UoZGF0YSwgZXh0ZW50KSB7XG4gICAgICAgIHZhciB0aW1lTWluID0gZXh0ZW50WzBdO1xuICAgICAgICB2YXIgdGltZU1heCA9IGV4dGVudFsxXTtcblxuICAgICAgICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24oZGF0dW0pIHtcbiAgICAgICAgICB2YXIgdGltZU1pbiA9IGJydXNoLmV4dGVudCgpWzBdO1xuICAgICAgICAgIHZhciB0aW1lTWF4ID0gYnJ1c2guZXh0ZW50KClbMV07XG4gICAgICAgICAgcmV0dXJuIGRhdHVtLnRpbWUgPj0gdGltZU1pbiAmJiBkYXR1bS50aW1lIDw9IHRpbWVNYXg7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJydXNoZWQoKSB7XG4gICAgICB2YXIgZm9jdXNEb21haW47XG4gICAgICB2YXIgZmlsdGVyZWREYXRhO1xuXG4gICAgICBpZighYnJ1c2guZW1wdHkoKSkge1xuICAgICAgICBmb2N1c0RvbWFpbiA9IGJydXNoLmV4dGVudCgpO1xuICAgICAgICBmaWx0ZXJlZERhdGEgPSBmaWx0ZXJEYXRhQnlEYXRlUmFuZ2UoZGF0YSwgZm9jdXNEb21haW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9jdXNEb21haW4gPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkLnRpbWU7fSk7XG4gICAgICAgIGZpbHRlcmVkRGF0YSA9IGRhdGE7XG4gICAgICB9IFxuXG4gICAgICBmb2N1cy5icnVzaERvbWFpbihmb2N1c0RvbWFpbik7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgICAgZDMuc2VsZWN0KCd0YWJsZScpLnJlbW92ZSgpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNkYXRhLXRhYmxlJylcbiAgICAgICAgLmRhdHVtKGZpbHRlcmVkRGF0YSlcbiAgICAgICAgLmNhbGwoZGF0YVRhYmxlKTtcblxuICAgICAgZDMuc2VsZWN0KCcjY29udGV4dCcpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChjb250ZXh0KTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIHZhciBicnVzaEV4dGVudCA9IGJydXNoLmV4dGVudCgpO1xuICAgICAgYnJ1c2hlZCgpO1xuICAgICAgZDMuc2VsZWN0KCcuYnJ1c2gnKS5jYWxsKGJydXNoLmV4dGVudChicnVzaEV4dGVudCkpO1xuICAgIH1cblxuXG5cbiAgICAvL1NjYWxlIGNoYXJ0cyBvbiByZXNpemVcbiAgICBkMy5zZWxlY3Qod2luZG93KS5vbigncmVzaXplJywgcmVzaXplKTtcblxuICAgIGZ1bmN0aW9uIHJlc2l6ZSgpIHtcbiAgICAgIHdpZHRoID0gcGFyc2VJbnQoZDMuc2VsZWN0KCcuY29udGVudC1jb250YWluZXInKS5zdHlsZSgnd2lkdGgnKSk7XG4gICAgICBcbiAgICAgIGZvY3VzLndpZHRoKHdpZHRoKTtcbiAgICAgIGNvbnRleHQud2lkdGgod2lkdGgpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChmb2N1cyk7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRleHQnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoY29udGV4dCk7XG4gICAgfVxuXG4gIH0pO1xuXG59OyIsIi8vQWRhcHRlZCBmcm9tIGh0dHA6Ly9ib3N0Lm9ja3Mub3JnL21pa2UvY2hhcnQvdGltZS1zZXJpZXMtY2hhcnQuanNcbid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcblxuZnVuY3Rpb24gbGluZUNoYXJ0KCkge1xuXG4gIHZhciBtYXJnaW4gPSB7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDIwLCBsZWZ0OiA0MH07XG4gIHZhciB3aWR0aCA9IDk2MDtcbiAgdmFyIGhlaWdodCA9IDUwMDtcbiAgdmFyIHhWYWx1ZSA9IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbMF07IH07XG4gIHZhciB5VmFsdWUgPSBmdW5jdGlvbihkKSB7IHJldHVybiBkWzFdOyB9O1xuICB2YXIgeCA9IGQzLnRpbWUuc2NhbGUoKS5yYW5nZShbMCwgd2lkdGhdKTtcbiAgdmFyIHkgPSBkMy5zY2FsZS5saW5lYXIoKS5yYW5nZShbaGVpZ2h0LCAwXSk7XG4gIHZhciB4U2NhbGUgPSBkMy50aW1lLnNjYWxlKCk7XG4gIHZhciB5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKTtcbiAgdmFyIHhBeGlzID0gZDMuc3ZnLmF4aXMoKS5zY2FsZSh4U2NhbGUpLm9yaWVudCgnYm90dG9tJyk7XG4gIHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKS54KFgpLnkoWSk7XG5cbiAgdmFyIHlQYWRkaW5nID0gMC4wMjU7XG5cbiAgdmFyIGFwcGVuZFlBeGlzID0gZmFsc2U7XG4gIHZhciB5QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeVNjYWxlKS5vcmllbnQoJ2xlZnQnKTtcblxuICB2YXIgYXBwZW5kRGF0YVBvaW50cyA9IGZhbHNlO1xuXG4gIHZhciBhcHBlbmRCcnVzaCA9IGZhbHNlO1xuICB2YXIgYnJ1c2hEb21haW47XG4gIC8vIHZhciBicnVzaCA9IGQzLnN2Zy5icnVzaCgpLngoWCkub24oJ2JydXNoJywgYnJ1c2hlZClcblxuICBmdW5jdGlvbiBjaGFydChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgIC8vIENvbnZlcnQgZGF0YSB0byBzdGFuZGFyZCByZXByZXNlbnRhdGlvbiBncmVlZGlseTtcbiAgICAgIC8vIHRoaXMgaXMgbmVlZGVkIGZvciBub25kZXRlcm1pbmlzdGljIGFjY2Vzc29ycy5cbiAgICAgIGRhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHJldHVybiBbeFZhbHVlLmNhbGwoZGF0YSwgZCwgaSksIHlWYWx1ZS5jYWxsKGRhdGEsIGQsIGkpXTtcbiAgICAgIH0pO1xuXG4gICAgICBpZihicnVzaERvbWFpbikge1xuICAgICAgICB4U2NhbGVcbiAgICAgICAgICAuZG9tYWluKGJydXNoRG9tYWluKVxuICAgICAgICAgIC5yYW5nZShbMCwgd2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeFNjYWxlXG4gICAgICAgICAgLmRvbWFpbihkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzBdOyB9KSlcbiAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHlFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzFdOyB9KTtcbiAgICAgIHZhciB5TWluID0geUV4dGVudFswXSAqICgxIC0geVBhZGRpbmcpO1xuICAgICAgdmFyIHlNYXggPSB5RXh0ZW50WzFdICogKDEgKyB5UGFkZGluZyk7XG5cbiAgICAgIHlTY2FsZVxuICAgICAgICAuZG9tYWluKFt5TWluLCB5TWF4XSlcbiAgICAgICAgLnJhbmdlKFtoZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbSwgMF0pO1xuXG4gICAgICAvL1NlbGVjdCB0aGUgc3ZnIGVsZW1lbnQgaWYgaXQgZXhpc3RzXG4gICAgICB2YXIgc3ZnID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgnc3ZnJykuZGF0YShbZGF0YV0pO1xuXG4gICAgICAvL090aGVyd2lzZSwgY3JlYXRlIHRoZSBza2VsZXRhbCBjaGFydFxuICAgICAgdmFyIGdFbnRlciA9IHN2Zy5lbnRlcigpLmFwcGVuZCgnc3ZnJykuYXBwZW5kKCdnJyk7XG4gICAgICBnRW50ZXIuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnbGluZScpO1xuICAgICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggYXhpcycpO1xuICAgICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgYXhpcycpO1xuXG4gICAgICAvL3VwZGF0ZSB0aGUgb3V0ZXIgZGltZW5zaW9uc1xuICAgICAgc3ZnXG4gICAgICAgIC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICAgICAgLy91cGRhdGUgdGhlIGlubmVyIGRpbWVuc2lvbnNcbiAgICAgIHZhciBnID0gc3ZnLnNlbGVjdCgnZycpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKTtcblxuICAgICAgLy9BZGQgY2xpcCBwYXRoIHNvIGRhdGEgZG9lc24ndCBjcm9zcyBheGlzXG4gICAgICBzdmcuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJjbGlwUGF0aFwiKVxuICAgICAgICAgIC5hdHRyKFwiaWRcIiwgXCJjbGlwXCIpXG4gICAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQpO1xuXG5cbiAgICAgIC8vdXBkYXRlIHRoZSBsaW5lIHBhdGhcbiAgICAgIGcuc2VsZWN0KCcubGluZScpXG4gICAgICAgIC5hdHRyKCdkJywgbGluZSk7XG5cbiAgICAgIC8vdXBkYXRlIHRoZSB4IGF4aXNcbiAgICAgIGcuc2VsZWN0KCcueC5heGlzJylcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIHlTY2FsZS5yYW5nZSgpWzBdICsgXCIpXCIpXG4gICAgICAgIC5jYWxsKHhBeGlzKTtcblxuICAgICAgLy91cGRhdGUgdGhlIHkgYXhpc1xuICAgICAgaWYoYXBwZW5kWUF4aXMgPT09IHRydWUpIHtcbiAgICAgICAgZy5zZWxlY3QoJy55LmF4aXMnKVxuICAgICAgICAgIC5jYWxsKHlBeGlzKTsgICAgICAgIFxuICAgICAgfVxuXG4gICAgICAvL3VwZGF0ZSB0aGUgZGF0YSBwb2ludHNcbiAgICAgIGlmKGFwcGVuZERhdGFQb2ludHMgPT09IHRydWUpIHtcblxuICAgICAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAncG9pbnRzJyk7XG5cbiAgICAgICAgZy5zZWxlY3QoJ2cucG9pbnRzJylcbiAgICAgICAgICAuc2VsZWN0QWxsKCdjaXJjbGUucG9pbnQnKVxuICAgICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgICAgLmVudGVyKClcbiAgICAgICAgICAuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdwb2ludCcpXG4gICAgICAgICAgLmF0dHIoJ3InLCAzLjUpO1xuXG4gICAgICAgIGcuc2VsZWN0QWxsKCdjaXJjbGUucG9pbnQnKVxuICAgICAgICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHhTY2FsZShkWzBdKTsgfSlcbiAgICAgICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7IHJldHVybiB5U2NhbGUoZFsxXSk7IH0pO1xuICAgICAgfVxuXG4gICAgfSk7XG4gIH1cblxuXG5cbiAgLy8gVGhlIHgtYWNjZXNzb3IgZm9yIHRoZSBwYXRoIGdlbmVyYXRvcjsgeFNjYWxlIOKImCB4VmFsdWUuXG4gIGZ1bmN0aW9uIFgoZCkge1xuICAgIHJldHVybiB4U2NhbGUoZFswXSk7XG4gIH1cblxuICAvLyBUaGUgeC1hY2Nlc3NvciBmb3IgdGhlIHBhdGggZ2VuZXJhdG9yOyB5U2NhbGUg4oiYIHlWYWx1ZS5cbiAgZnVuY3Rpb24gWShkKSB7XG4gICAgcmV0dXJuIHlTY2FsZShkWzFdKTtcbiAgfVxuXG4gIGNoYXJ0Lm1hcmdpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtYXJnaW47XG4gICAgbWFyZ2luID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQud2lkdGggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gd2lkdGg7XG4gICAgd2lkdGggPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5oZWlnaHQgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaGVpZ2h0O1xuICAgIGhlaWdodCA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geFZhbHVlO1xuICAgIHhWYWx1ZSA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnkgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geVZhbHVlO1xuICAgIHlWYWx1ZSA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmFwcGVuZFlBeGlzID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYXBwZW5kWUF4aXM7XG4gICAgYXBwZW5kWUF4aXMgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5hcHBlbmREYXRhUG9pbnRzID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYXBwZW5kRGF0YVBvaW50cztcbiAgICBhcHBlbmREYXRhUG9pbnRzID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQueFNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geFNjYWxlO1xuICAgIHhTY2FsZSA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmJydXNoRG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYnJ1c2hEb21haW47XG4gICAgYnJ1c2hEb21haW4gPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC55UGFkZGluZyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHlQYWRkaW5nO1xuICAgIHlQYWRkaW5nID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgcmV0dXJuIGNoYXJ0O1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGluZUNoYXJ0OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcblxuZnVuY3Rpb24gdGFidWxhdGUoKSB7XG5cbiAgZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyg/Ol58XFxzKVxcUy9nLCBmdW5jdGlvbihhKSB7IHJldHVybiBhLnRvVXBwZXJDYXNlKCk7IH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFibGUoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAvL0NyZWF0ZSBhcnJheSBvZiBjb2x1bW5zIGZyb20gZGF0YSBrZXlzXG4gICAgICB2YXIgY29sdW1ucyA9IFtdO1xuICAgICAgdmFyIGRhdGFTYW1wbGUgPSBkYXRhWzBdO1xuXG4gICAgICBmb3IodmFyIGtleSBpbiBkYXRhU2FtcGxlKSB7XG4gICAgICAgIGNvbHVtbnMucHVzaChrZXkpO1xuICAgICAgfVxuXG4gICAgICAvL0NyZWF0ZSBhcnJheSBvZiBkYXRhXG4gICAgICB2YXIgY2VsbERhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICAgIHJldHVybiB7Y29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXX07XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vU2VsZWN0IHRoZSBzdmcgZWxlbWVudCBpZiBpdCBleGlzdHNcbiAgICAgIHZhciB0YWJsZSA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RhYmxlJykuZGF0YShbZGF0YV0pO1xuXG4gICAgICB2YXIgdEVudGVyID0gdGFibGUuZW50ZXIoKS5hcHBlbmQoJ3RhYmxlJyk7XG4gICAgICB2YXIgdGhlYWQgPSB0RW50ZXIuYXBwZW5kKCd0aGVhZCcpO1xuICAgICAgdmFyIHRib2R5ID0gdEVudGVyLmFwcGVuZCgndGJvZHknKTtcblxuXG4gICAgICAvL0FwcGVuZCBoZWFkZXIgcm93XG4gICAgICB0aGVhZC5hcHBlbmQoJ3RyJylcbiAgICAgICAgLnNlbGVjdEFsbCgndGgnKVxuICAgICAgICAuZGF0YShjb2x1bW5zKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0aCcpXG4gICAgICAgIC50ZXh0KGZ1bmN0aW9uKGNvbHVtbikge3JldHVybiBjYXBpdGFsaXplKGNvbHVtbik7fSk7XG5cblxuICAgICAgLy9DcmVhdGUgUm93c1xuICAgICAgdmFyIHJvd3MgPSB0Ym9keS5zZWxlY3RBbGwoJ3RyJylcbiAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgndHInKTtcblxuICAgICAgLy9DcmVhdGUgY2VsbHMgaW4gZWFjaCByb3cgZm9yIGVhY2ggY29sdW1uXG4gICAgICB2YXIgY2VsbHMgPSByb3dzLnNlbGVjdEFsbCgndGQnKVxuICAgICAgICAuZGF0YShmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm4ge2NvbHVtbjogY29sdW1uLCB2YWx1ZTogcm93W2NvbHVtbl19O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0ZCcpXG4gICAgICAgIC5odG1sKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudmFsdWU7IH0pO1xuICAgIH0pO1xuXG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGFidWxhdGU7XG5cblxuIiwidmFyIGlvID0gcmVxdWlyZSgnc29ja2V0LmlvLWNsaWVudCcpO1xudmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuXG5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byB3ZWJzb2NrZXRzJyk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzb2NrZXQ7XG5cblxuIl19
