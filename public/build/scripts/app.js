(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
// require('./charts.js')();
require('./d3-charts.js')();
},{"./d3-charts.js":2}],2:[function(require,module,exports){
//Adapted from http://bl.ocks.org/mbostock/1667367
'use strict';

var d3 = require('d3');
// var lineChart = require('./linechart.js');
var lineChart = require('./linechart-refactor');
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
},{"./linechart-refactor":3,"./table.js":4,"./websockets.js":5,"d3":"d3"}],3:[function(require,module,exports){
'use strict';

var d3 = require('d3');

function lineChart() {

  var svg;
  var gEnter;
  var g;
  var data = []

  //Default config
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

  //Optional
  var brushDomain;
  var appendBrush = false;
  var appendYAxis = false;
  var yAxis = d3.svg.axis().scale(yScale).orient('left');
  var appendDataPoints = false;

  function chart(selection) {
    selection.each(function(response) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = response.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      updateXScale();
      updateYScale();
      createSkeleton(this);
      updateDimensions();
      updateLine();
      updateXAxis();

      if(appendYAxis === true) { updateYAxis(); };
      if(appendDataPoints === true) { updateDataPoints(); };

      appendClip();

    })
  }

  function updateXScale() {
    if(brushDomain) {
      xScale
        .domain(brushDomain)
        .range([0, width - margin.left - margin.right]);
    } else {
      xScale
        .domain(d3.extent(data, function(d) {return d[0]; }))
        .range([0, width - margin.left - margin.right]);
    }
  }

  function updateYScale() {
    var yExtent = d3.extent(data, function(d) {return d[1]; });
    var yMin = yExtent[0] * (1 - yPadding);
    var yMax = yExtent[1] * (1 + yPadding);

    yScale
      .domain([yMin, yMax])
      .range([height - margin.top - margin.bottom, 0]);
  }

  function createSkeleton(selection) {
    //Select the svg element if it exists
    svg = d3.select(selection).selectAll('svg').data([data]);

    //Otherwise, create the skeletal chart
    gEnter = svg.enter().append('svg').append('g');
    gEnter.append('path').attr('class', 'line');
    gEnter.append('g').attr('class', 'x axis');
    gEnter.append('g').attr('class', 'y axis');
  }

  function updateDimensions() {
    //update the outer dimensions
    svg
      .attr('width', width)
      .attr('height', height);

    //update the inner dimensions
    g = svg.select('g')
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  }

  function appendClip() {
    d3.selectAll('defs').remove();
    //Add clip path so data doesn't cross axis
    svg.append("defs").append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);
  }

  function updateLine() {
    g.select('.line')
      .attr('d', line);
  }

  function updateXAxis() {
    g.select('.x.axis')
      .attr("transform", "translate(0," + yScale.range()[0] + ")")
      .call(xAxis);    
  }

  function updateYAxis() {
    g.select('.y.axis')
      .call(yAxis);    
  }

  function updateDataPoints() {
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

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  //Getters and setters
  chart.margin = function(_) {
    if(!arguments.length) return margin;
    margin = _;
    return this
  }

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return this;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return this;
  };

  chart.appendYAxis = function(_) {
    if(!arguments.length) return appendYAxis;
    appendYAxis = _;
    return this;
  };

  chart.appendDataPoints = function(_) {
    if(!arguments.length) return appendDataPoints;
    appendDataPoints = _;
    return this;
  };

  chart.xScale = function(_) {
    if(!arguments.length) return xScale;
    xScale = _;
    return this;
  };

  chart.brushDomain = function(_) {
    if(!arguments.length) return brushDomain;
    brushDomain = _;
    return this;
  };

  chart.yPadding = function(_) {
    if(!arguments.length) return yPadding;
    yPadding = _;
    return this;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvbGluZWNoYXJ0LXJlZmFjdG9yLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3RhYmxlLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3dlYnNvY2tldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gcmVxdWlyZSgnLi9jaGFydC5qcycpKCk7XG4vLyByZXF1aXJlKCcuL2NoYXJ0cy5qcycpKCk7XG5yZXF1aXJlKCcuL2QzLWNoYXJ0cy5qcycpKCk7IiwiLy9BZGFwdGVkIGZyb20gaHR0cDovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzE2NjczNjdcbid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcbi8vIHZhciBsaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2xpbmVjaGFydC5qcycpO1xudmFyIGxpbmVDaGFydCA9IHJlcXVpcmUoJy4vbGluZWNoYXJ0LXJlZmFjdG9yJyk7XG52YXIgdGFidWxhdGUgPSByZXF1aXJlKCcuL3RhYmxlLmpzJyk7XG52YXIgaW8gPSByZXF1aXJlKCcuL3dlYnNvY2tldHMuanMnKTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHdpZHRoID0gcGFyc2VJbnQoZDMuc2VsZWN0KCcuY29udGVudC1jb250YWluZXInKS5zdHlsZSgnd2lkdGgnKSk7XG5cbiAgZnVuY3Rpb24gcGFyc2VQcmljZShwcmljZSkge1xuICAgIHZhciBwYXJzZWRQcmljZSA9IHt9O1xuICAgIHBhcnNlZFByaWNlLnRpbWUgPSBuZXcgRGF0ZShwcmljZS50aW1lKTtcbiAgICBwYXJzZWRQcmljZS5wcmljZSA9ICtwcmljZS5sYXN0UHJpY2U7XG5cbiAgICByZXR1cm4gcGFyc2VkUHJpY2U7XG4gIH1cblxuICBkMy5qc29uKCcvcHJpY2VzJywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEucHJpY2VzLm1hcChwYXJzZVByaWNlKTtcblxuICAgIGlvLm9uKCdwcmljZScsIGZ1bmN0aW9uKHByaWNlKSB7XG4gICAgICB2YXIgbmV3UHJpY2UgPSBwYXJzZVByaWNlKHByaWNlKTtcblxuICAgICAgaWYoSlNPTi5zdHJpbmdpZnkobmV3UHJpY2UpICE9PSBKU09OLnN0cmluZ2lmeShkYXRhW2RhdGEubGVuZ3RoIC0gMV0pKSB7XG4gICAgICAgIGRhdGEucHVzaChuZXdQcmljZSk7XG4gICAgICAgIHVwZGF0ZSgpOyAgICAgICAgXG4gICAgICB9XG5cbiAgICB9KTtcblxuICAgIHZhciBjb250ZXh0ID0gbGluZUNoYXJ0KCkgICAgXG4gICAgICAueChmdW5jdGlvbihkKSB7IHJldHVybiBkLnRpbWU7IH0pXG4gICAgICAueShmdW5jdGlvbihkKSB7IHJldHVybiBkLnByaWNlOyB9KVxuICAgICAgLnlQYWRkaW5nKDAuMDEpXG4gICAgICAuaGVpZ2h0KDEwMClcbiAgICAgIC53aWR0aCh3aWR0aCk7XG5cblxuICAgIHZhciBmb2N1cyA9IGxpbmVDaGFydCgpXG4gICAgICAueChmdW5jdGlvbihkKSB7IHJldHVybiBkLnRpbWU7IH0pXG4gICAgICAueShmdW5jdGlvbihkKSB7IHJldHVybiBkLnByaWNlOyB9KVxuICAgICAgLndpZHRoKHdpZHRoKVxuICAgICAgLm1hcmdpbih7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDMwLCBsZWZ0OiA0MH0pXG4gICAgICAuYXBwZW5kWUF4aXModHJ1ZSlcbiAgICAgIC5hcHBlbmREYXRhUG9pbnRzKHRydWUpO1xuXG5cbiAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgIGQzLnNlbGVjdCgnI2NvbnRleHQnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuY2FsbChjb250ZXh0KTtcblxuICAgIC8vQWRkaW5nIGJydXNoIHRvIHRoZSBjb250ZXh0IGNoYXJ0XG4gICAgdmFyIGJydXNoID0gZDMuc3ZnLmJydXNoKClcbiAgICAgIC54KGNvbnRleHQueFNjYWxlKCkpXG4gICAgICAub24oJ2JydXNoJywgYnJ1c2hlZCk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb250ZXh0IHN2ZycpXG4gICAgICAuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGJydXNoXCIpXG4gICAgICAuY2FsbChicnVzaClcbiAgICAgIC5zZWxlY3RBbGwoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcInlcIiwgLTYpXG4gICAgICAuYXR0cihcImhlaWdodFwiLCBjb250ZXh0LmhlaWdodCgpICsgNylcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb250ZXh0Lm1hcmdpbigpLmxlZnQgKyAnLDApJyk7XG5cbiAgICB2YXIgZGF0YVRhYmxlID0gdGFidWxhdGUoKTtcblxuICAgIGQzLnNlbGVjdCgnI2RhdGEtdGFibGUnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuY2FsbChkYXRhVGFibGUpO1xuXG5cblxuXG4gICAgZnVuY3Rpb24gZmlsdGVyRGF0YUJ5RGF0ZVJhbmdlKGRhdGEsIGV4dGVudCkge1xuICAgICAgICB2YXIgdGltZU1pbiA9IGV4dGVudFswXTtcbiAgICAgICAgdmFyIHRpbWVNYXggPSBleHRlbnRbMV07XG5cbiAgICAgICAgcmV0dXJuIGRhdGEuZmlsdGVyKGZ1bmN0aW9uKGRhdHVtKSB7XG4gICAgICAgICAgdmFyIHRpbWVNaW4gPSBicnVzaC5leHRlbnQoKVswXTtcbiAgICAgICAgICB2YXIgdGltZU1heCA9IGJydXNoLmV4dGVudCgpWzFdO1xuICAgICAgICAgIHJldHVybiBkYXR1bS50aW1lID49IHRpbWVNaW4gJiYgZGF0dW0udGltZSA8PSB0aW1lTWF4O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBicnVzaGVkKCkge1xuICAgICAgdmFyIGZvY3VzRG9tYWluO1xuICAgICAgdmFyIGZpbHRlcmVkRGF0YTtcblxuICAgICAgaWYoIWJydXNoLmVtcHR5KCkpIHtcbiAgICAgICAgZm9jdXNEb21haW4gPSBicnVzaC5leHRlbnQoKTtcbiAgICAgICAgZmlsdGVyZWREYXRhID0gZmlsdGVyRGF0YUJ5RGF0ZVJhbmdlKGRhdGEsIGZvY3VzRG9tYWluKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvY3VzRG9tYWluID0gZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC50aW1lO30pO1xuICAgICAgICBmaWx0ZXJlZERhdGEgPSBkYXRhO1xuICAgICAgfSBcblxuICAgICAgZm9jdXMuYnJ1c2hEb21haW4oZm9jdXNEb21haW4pO1xuXG4gICAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChmb2N1cyk7XG5cbiAgICAgIGQzLnNlbGVjdCgndGFibGUnKS5yZW1vdmUoKTtcblxuICAgICAgZDMuc2VsZWN0KCcjZGF0YS10YWJsZScpXG4gICAgICAgIC5kYXR1bShmaWx0ZXJlZERhdGEpXG4gICAgICAgIC5jYWxsKGRhdGFUYWJsZSk7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRleHQnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoY29udGV4dCk7XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICB2YXIgYnJ1c2hFeHRlbnQgPSBicnVzaC5leHRlbnQoKTtcbiAgICAgIGJydXNoZWQoKTtcbiAgICAgIGQzLnNlbGVjdCgnLmJydXNoJykuY2FsbChicnVzaC5leHRlbnQoYnJ1c2hFeHRlbnQpKTtcbiAgICB9XG5cblxuXG4gICAgLy9TY2FsZSBjaGFydHMgb24gcmVzaXplXG4gICAgZDMuc2VsZWN0KHdpbmRvdykub24oJ3Jlc2l6ZScsIHJlc2l6ZSk7XG5cbiAgICBmdW5jdGlvbiByZXNpemUoKSB7XG4gICAgICB3aWR0aCA9IHBhcnNlSW50KGQzLnNlbGVjdCgnLmNvbnRlbnQtY29udGFpbmVyJykuc3R5bGUoJ3dpZHRoJykpO1xuICAgICAgXG4gICAgICBmb2N1cy53aWR0aCh3aWR0aCk7XG4gICAgICBjb250ZXh0LndpZHRoKHdpZHRoKTtcblxuICAgICAgZDMuc2VsZWN0KCcjZm9jdXMnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoZm9jdXMpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZXh0JylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGNvbnRleHQpO1xuICAgIH1cblxuICB9KTtcblxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbmZ1bmN0aW9uIGxpbmVDaGFydCgpIHtcblxuICB2YXIgc3ZnO1xuICB2YXIgZ0VudGVyO1xuICB2YXIgZztcbiAgdmFyIGRhdGEgPSBbXVxuXG4gIC8vRGVmYXVsdCBjb25maWdcbiAgdmFyIG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMjAsIGxlZnQ6IDQwfTtcbiAgdmFyIHdpZHRoID0gOTYwO1xuICB2YXIgaGVpZ2h0ID0gNTAwO1xuICB2YXIgeFZhbHVlID0gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFswXTsgfTtcbiAgdmFyIHlWYWx1ZSA9IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbMV07IH07XG4gIHZhciB4ID0gZDMudGltZS5zY2FsZSgpLnJhbmdlKFswLCB3aWR0aF0pO1xuICB2YXIgeSA9IGQzLnNjYWxlLmxpbmVhcigpLnJhbmdlKFtoZWlnaHQsIDBdKTtcbiAgdmFyIHhTY2FsZSA9IGQzLnRpbWUuc2NhbGUoKTtcbiAgdmFyIHlTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpO1xuICB2YXIgeEF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHhTY2FsZSkub3JpZW50KCdib3R0b20nKTtcbiAgdmFyIGxpbmUgPSBkMy5zdmcubGluZSgpLngoWCkueShZKTtcbiAgdmFyIHlQYWRkaW5nID0gMC4wMjU7XG5cbiAgLy9PcHRpb25hbFxuICB2YXIgYnJ1c2hEb21haW47XG4gIHZhciBhcHBlbmRCcnVzaCA9IGZhbHNlO1xuICB2YXIgYXBwZW5kWUF4aXMgPSBmYWxzZTtcbiAgdmFyIHlBeGlzID0gZDMuc3ZnLmF4aXMoKS5zY2FsZSh5U2NhbGUpLm9yaWVudCgnbGVmdCcpO1xuICB2YXIgYXBwZW5kRGF0YVBvaW50cyA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGNoYXJ0KHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cbiAgICAgIC8vIENvbnZlcnQgZGF0YSB0byBzdGFuZGFyZCByZXByZXNlbnRhdGlvbiBncmVlZGlseTtcbiAgICAgIC8vIHRoaXMgaXMgbmVlZGVkIGZvciBub25kZXRlcm1pbmlzdGljIGFjY2Vzc29ycy5cbiAgICAgIGRhdGEgPSByZXNwb25zZS5tYXAoZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICByZXR1cm4gW3hWYWx1ZS5jYWxsKGRhdGEsIGQsIGkpLCB5VmFsdWUuY2FsbChkYXRhLCBkLCBpKV07XG4gICAgICB9KTtcblxuICAgICAgdXBkYXRlWFNjYWxlKCk7XG4gICAgICB1cGRhdGVZU2NhbGUoKTtcbiAgICAgIGNyZWF0ZVNrZWxldG9uKHRoaXMpO1xuICAgICAgdXBkYXRlRGltZW5zaW9ucygpO1xuICAgICAgdXBkYXRlTGluZSgpO1xuICAgICAgdXBkYXRlWEF4aXMoKTtcblxuICAgICAgaWYoYXBwZW5kWUF4aXMgPT09IHRydWUpIHsgdXBkYXRlWUF4aXMoKTsgfTtcbiAgICAgIGlmKGFwcGVuZERhdGFQb2ludHMgPT09IHRydWUpIHsgdXBkYXRlRGF0YVBvaW50cygpOyB9O1xuXG4gICAgICBhcHBlbmRDbGlwKCk7XG5cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlWFNjYWxlKCkge1xuICAgIGlmKGJydXNoRG9tYWluKSB7XG4gICAgICB4U2NhbGVcbiAgICAgICAgLmRvbWFpbihicnVzaERvbWFpbilcbiAgICAgICAgLnJhbmdlKFswLCB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHhTY2FsZVxuICAgICAgICAuZG9tYWluKGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7cmV0dXJuIGRbMF07IH0pKVxuICAgICAgICAucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVZU2NhbGUoKSB7XG4gICAgdmFyIHlFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzFdOyB9KTtcbiAgICB2YXIgeU1pbiA9IHlFeHRlbnRbMF0gKiAoMSAtIHlQYWRkaW5nKTtcbiAgICB2YXIgeU1heCA9IHlFeHRlbnRbMV0gKiAoMSArIHlQYWRkaW5nKTtcblxuICAgIHlTY2FsZVxuICAgICAgLmRvbWFpbihbeU1pbiwgeU1heF0pXG4gICAgICAucmFuZ2UoW2hlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tLCAwXSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVTa2VsZXRvbihzZWxlY3Rpb24pIHtcbiAgICAvL1NlbGVjdCB0aGUgc3ZnIGVsZW1lbnQgaWYgaXQgZXhpc3RzXG4gICAgc3ZnID0gZDMuc2VsZWN0KHNlbGVjdGlvbikuc2VsZWN0QWxsKCdzdmcnKS5kYXRhKFtkYXRhXSk7XG5cbiAgICAvL090aGVyd2lzZSwgY3JlYXRlIHRoZSBza2VsZXRhbCBjaGFydFxuICAgIGdFbnRlciA9IHN2Zy5lbnRlcigpLmFwcGVuZCgnc3ZnJykuYXBwZW5kKCdnJyk7XG4gICAgZ0VudGVyLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2xpbmUnKTtcbiAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneCBheGlzJyk7XG4gICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgYXhpcycpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlRGltZW5zaW9ucygpIHtcbiAgICAvL3VwZGF0ZSB0aGUgb3V0ZXIgZGltZW5zaW9uc1xuICAgIHN2Z1xuICAgICAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gICAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICAgIC8vdXBkYXRlIHRoZSBpbm5lciBkaW1lbnNpb25zXG4gICAgZyA9IHN2Zy5zZWxlY3QoJ2cnKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIilcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGVuZENsaXAoKSB7XG4gICAgZDMuc2VsZWN0QWxsKCdkZWZzJykucmVtb3ZlKCk7XG4gICAgLy9BZGQgY2xpcCBwYXRoIHNvIGRhdGEgZG9lc24ndCBjcm9zcyBheGlzXG4gICAgc3ZnLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwiY2xpcFBhdGhcIilcbiAgICAgICAgLmF0dHIoXCJpZFwiLCBcImNsaXBcIilcbiAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVMaW5lKCkge1xuICAgIGcuc2VsZWN0KCcubGluZScpXG4gICAgICAuYXR0cignZCcsIGxpbmUpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlWEF4aXMoKSB7XG4gICAgZy5zZWxlY3QoJy54LmF4aXMnKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIHlTY2FsZS5yYW5nZSgpWzBdICsgXCIpXCIpXG4gICAgICAuY2FsbCh4QXhpcyk7ICAgIFxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlWUF4aXMoKSB7XG4gICAgZy5zZWxlY3QoJy55LmF4aXMnKVxuICAgICAgLmNhbGwoeUF4aXMpOyAgICBcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZURhdGFQb2ludHMoKSB7XG4gICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3BvaW50cycpO1xuXG4gICAgZy5zZWxlY3QoJ2cucG9pbnRzJylcbiAgICAgIC5zZWxlY3RBbGwoJ2NpcmNsZS5wb2ludCcpXG4gICAgICAuZGF0YShkYXRhKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAuYXR0cignY2xhc3MnLCAncG9pbnQnKVxuICAgICAgLmF0dHIoJ3InLCAzLjUpO1xuXG4gICAgZy5zZWxlY3RBbGwoJ2NpcmNsZS5wb2ludCcpXG4gICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7IHJldHVybiB4U2NhbGUoZFswXSk7IH0pXG4gICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7IHJldHVybiB5U2NhbGUoZFsxXSk7IH0pO1xuICB9XG5cbiAgLy8gVGhlIHgtYWNjZXNzb3IgZm9yIHRoZSBwYXRoIGdlbmVyYXRvcjsgeFNjYWxlIOKImCB4VmFsdWUuXG4gIGZ1bmN0aW9uIFgoZCkge1xuICAgIHJldHVybiB4U2NhbGUoZFswXSk7XG4gIH1cblxuICAvLyBUaGUgeC1hY2Nlc3NvciBmb3IgdGhlIHBhdGggZ2VuZXJhdG9yOyB5U2NhbGUg4oiYIHlWYWx1ZS5cbiAgZnVuY3Rpb24gWShkKSB7XG4gICAgcmV0dXJuIHlTY2FsZShkWzFdKTtcbiAgfVxuXG4gIC8vR2V0dGVycyBhbmQgc2V0dGVyc1xuICBjaGFydC5tYXJnaW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtYXJnaW47XG4gICAgbWFyZ2luID0gXztcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgY2hhcnQud2lkdGggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gd2lkdGg7XG4gICAgd2lkdGggPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LmhlaWdodCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBoZWlnaHQ7XG4gICAgaGVpZ2h0ID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC54ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHhWYWx1ZTtcbiAgICB4VmFsdWUgPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LnkgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geVZhbHVlO1xuICAgIHlWYWx1ZSA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQuYXBwZW5kWUF4aXMgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBhcHBlbmRZQXhpcztcbiAgICBhcHBlbmRZQXhpcyA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQuYXBwZW5kRGF0YVBvaW50cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGFwcGVuZERhdGFQb2ludHM7XG4gICAgYXBwZW5kRGF0YVBvaW50cyA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQueFNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geFNjYWxlO1xuICAgIHhTY2FsZSA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQuYnJ1c2hEb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBicnVzaERvbWFpbjtcbiAgICBicnVzaERvbWFpbiA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQueVBhZGRpbmcgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5UGFkZGluZztcbiAgICB5UGFkZGluZyA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcmV0dXJuIGNoYXJ0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpbmVDaGFydDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbmZ1bmN0aW9uIHRhYnVsYXRlKCkge1xuXG4gIGZ1bmN0aW9uIGNhcGl0YWxpemUoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oPzpefFxccylcXFMvZywgZnVuY3Rpb24oYSkgeyByZXR1cm4gYS50b1VwcGVyQ2FzZSgpOyB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRhYmxlKHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgLy9DcmVhdGUgYXJyYXkgb2YgY29sdW1ucyBmcm9tIGRhdGEga2V5c1xuICAgICAgdmFyIGNvbHVtbnMgPSBbXTtcbiAgICAgIHZhciBkYXRhU2FtcGxlID0gZGF0YVswXTtcblxuICAgICAgZm9yKHZhciBrZXkgaW4gZGF0YVNhbXBsZSkge1xuICAgICAgICBjb2x1bW5zLnB1c2goa2V5KTtcbiAgICAgIH1cblxuICAgICAgLy9DcmVhdGUgYXJyYXkgb2YgZGF0YVxuICAgICAgdmFyIGNlbGxEYXRhID0gZGF0YS5tYXAoZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIHJldHVybiBjb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4pIHtcbiAgICAgICAgICByZXR1cm4ge2NvbHVtbjogY29sdW1uLCB2YWx1ZTogcm93W2NvbHVtbl19O1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvL1NlbGVjdCB0aGUgc3ZnIGVsZW1lbnQgaWYgaXQgZXhpc3RzXG4gICAgICB2YXIgdGFibGUgPSBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0YWJsZScpLmRhdGEoW2RhdGFdKTtcblxuICAgICAgdmFyIHRFbnRlciA9IHRhYmxlLmVudGVyKCkuYXBwZW5kKCd0YWJsZScpO1xuICAgICAgdmFyIHRoZWFkID0gdEVudGVyLmFwcGVuZCgndGhlYWQnKTtcbiAgICAgIHZhciB0Ym9keSA9IHRFbnRlci5hcHBlbmQoJ3Rib2R5Jyk7XG5cblxuICAgICAgLy9BcHBlbmQgaGVhZGVyIHJvd1xuICAgICAgdGhlYWQuYXBwZW5kKCd0cicpXG4gICAgICAgIC5zZWxlY3RBbGwoJ3RoJylcbiAgICAgICAgLmRhdGEoY29sdW1ucylcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgndGgnKVxuICAgICAgICAudGV4dChmdW5jdGlvbihjb2x1bW4pIHtyZXR1cm4gY2FwaXRhbGl6ZShjb2x1bW4pO30pO1xuXG5cbiAgICAgIC8vQ3JlYXRlIFJvd3NcbiAgICAgIHZhciByb3dzID0gdGJvZHkuc2VsZWN0QWxsKCd0cicpXG4gICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ3RyJyk7XG5cbiAgICAgIC8vQ3JlYXRlIGNlbGxzIGluIGVhY2ggcm93IGZvciBlYWNoIGNvbHVtblxuICAgICAgdmFyIGNlbGxzID0gcm93cy5zZWxlY3RBbGwoJ3RkJylcbiAgICAgICAgLmRhdGEoZnVuY3Rpb24ocm93KSB7XG4gICAgICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICAgICAgcmV0dXJuIHtjb2x1bW46IGNvbHVtbiwgdmFsdWU6IHJvd1tjb2x1bW5dfTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgndGQnKVxuICAgICAgICAuaHRtbChmdW5jdGlvbihkKSB7IHJldHVybiBkLnZhbHVlOyB9KTtcbiAgICB9KTtcblxuICB9XG5cbiAgcmV0dXJuIHRhYmxlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRhYnVsYXRlO1xuXG5cbiIsInZhciBpbyA9IHJlcXVpcmUoJ3NvY2tldC5pby1jbGllbnQnKTtcbnZhciBzb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vbG9jYWxob3N0OjQwMDAnKTtcblxuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCdjb25uZWN0ZWQgdG8gd2Vic29ja2V0cycpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc29ja2V0O1xuXG5cbiJdfQ==
