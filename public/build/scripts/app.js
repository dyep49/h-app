(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
// require('./charts.js')();
require('./d3-charts.js')();
},{"./d3-charts.js":2}],2:[function(require,module,exports){
//Adapted from http://bl.ocks.org/mbostock/1667367
'use strict';

var d3 = require('d3');
// var lineChart = require('./linechart.js');
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
        console.log(newPrice);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvbGluZWNoYXJ0LmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3RhYmxlLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3dlYnNvY2tldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gcmVxdWlyZSgnLi9jaGFydC5qcycpKCk7XG4vLyByZXF1aXJlKCcuL2NoYXJ0cy5qcycpKCk7XG5yZXF1aXJlKCcuL2QzLWNoYXJ0cy5qcycpKCk7IiwiLy9BZGFwdGVkIGZyb20gaHR0cDovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzE2NjczNjdcbid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcbi8vIHZhciBsaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2xpbmVjaGFydC5qcycpO1xudmFyIGxpbmVDaGFydCA9IHJlcXVpcmUoJy4vbGluZWNoYXJ0LmpzJyk7XG52YXIgdGFidWxhdGUgPSByZXF1aXJlKCcuL3RhYmxlLmpzJyk7XG52YXIgaW8gPSByZXF1aXJlKCcuL3dlYnNvY2tldHMuanMnKTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHdpZHRoID0gcGFyc2VJbnQoZDMuc2VsZWN0KCcuY29udGVudC1jb250YWluZXInKS5zdHlsZSgnd2lkdGgnKSk7XG5cbiAgZnVuY3Rpb24gcGFyc2VQcmljZShwcmljZSkge1xuICAgIHZhciBwYXJzZWRQcmljZSA9IHt9O1xuICAgIHBhcnNlZFByaWNlLnRpbWUgPSBuZXcgRGF0ZShwcmljZS50aW1lKTtcbiAgICBwYXJzZWRQcmljZS5wcmljZSA9ICtwcmljZS5sYXN0UHJpY2U7XG5cbiAgICByZXR1cm4gcGFyc2VkUHJpY2U7XG4gIH1cblxuICBkMy5qc29uKCcvcHJpY2VzJywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEucHJpY2VzLm1hcChwYXJzZVByaWNlKTtcblxuICAgIGlvLm9uKCdwcmljZScsIGZ1bmN0aW9uKHByaWNlKSB7XG4gICAgICB2YXIgbmV3UHJpY2UgPSBwYXJzZVByaWNlKHByaWNlKTtcblxuICAgICAgaWYoSlNPTi5zdHJpbmdpZnkobmV3UHJpY2UpICE9PSBKU09OLnN0cmluZ2lmeShkYXRhW2RhdGEubGVuZ3RoIC0gMV0pKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG5ld1ByaWNlKTtcbiAgICAgICAgZGF0YS5wdXNoKG5ld1ByaWNlKTtcbiAgICAgICAgdXBkYXRlKCk7ICAgICAgICBcbiAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgdmFyIGNvbnRleHQgPSBsaW5lQ2hhcnQoKSAgICBcbiAgICAgIC54KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGltZTsgfSlcbiAgICAgIC55KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQucHJpY2U7IH0pXG4gICAgICAueVBhZGRpbmcoMC4wMSlcbiAgICAgIC5oZWlnaHQoMTAwKVxuICAgICAgLndpZHRoKHdpZHRoKTtcblxuXG4gICAgdmFyIGZvY3VzID0gbGluZUNoYXJ0KClcbiAgICAgIC54KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGltZTsgfSlcbiAgICAgIC55KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQucHJpY2U7IH0pXG4gICAgICAud2lkdGgod2lkdGgpXG4gICAgICAubWFyZ2luKHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMzAsIGxlZnQ6IDQwfSlcbiAgICAgIC5hcHBlbmRZQXhpcyh0cnVlKVxuICAgICAgLmFwcGVuZERhdGFQb2ludHModHJ1ZSk7XG5cblxuICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgLmNhbGwoZm9jdXMpO1xuXG4gICAgZDMuc2VsZWN0KCcjY29udGV4dCcpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGNvbnRleHQpO1xuXG4gICAgLy9BZGRpbmcgYnJ1c2ggdG8gdGhlIGNvbnRleHQgY2hhcnRcbiAgICB2YXIgYnJ1c2ggPSBkMy5zdmcuYnJ1c2goKVxuICAgICAgLngoY29udGV4dC54U2NhbGUoKSlcbiAgICAgIC5vbignYnJ1c2gnLCBicnVzaGVkKTtcblxuICAgIGQzLnNlbGVjdCgnI2NvbnRleHQgc3ZnJylcbiAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYnJ1c2hcIilcbiAgICAgIC5jYWxsKGJydXNoKVxuICAgICAgLnNlbGVjdEFsbChcInJlY3RcIilcbiAgICAgIC5hdHRyKFwieVwiLCAtNilcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGNvbnRleHQuaGVpZ2h0KCkgKyA3KVxuICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbnRleHQubWFyZ2luKCkubGVmdCArICcsMCknKTtcblxuICAgIHZhciBkYXRhVGFibGUgPSB0YWJ1bGF0ZSgpO1xuXG4gICAgZDMuc2VsZWN0KCcjZGF0YS10YWJsZScpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGRhdGFUYWJsZSk7XG5cblxuXG5cbiAgICBmdW5jdGlvbiBmaWx0ZXJEYXRhQnlEYXRlUmFuZ2UoZGF0YSwgZXh0ZW50KSB7XG4gICAgICAgIHZhciB0aW1lTWluID0gZXh0ZW50WzBdO1xuICAgICAgICB2YXIgdGltZU1heCA9IGV4dGVudFsxXTtcblxuICAgICAgICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24oZGF0dW0pIHtcbiAgICAgICAgICB2YXIgdGltZU1pbiA9IGJydXNoLmV4dGVudCgpWzBdO1xuICAgICAgICAgIHZhciB0aW1lTWF4ID0gYnJ1c2guZXh0ZW50KClbMV07XG4gICAgICAgICAgcmV0dXJuIGRhdHVtLnRpbWUgPj0gdGltZU1pbiAmJiBkYXR1bS50aW1lIDw9IHRpbWVNYXg7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJydXNoZWQoKSB7XG4gICAgICB2YXIgZm9jdXNEb21haW47XG4gICAgICB2YXIgZmlsdGVyZWREYXRhO1xuXG4gICAgICBpZighYnJ1c2guZW1wdHkoKSkge1xuICAgICAgICBmb2N1c0RvbWFpbiA9IGJydXNoLmV4dGVudCgpO1xuICAgICAgICBmaWx0ZXJlZERhdGEgPSBmaWx0ZXJEYXRhQnlEYXRlUmFuZ2UoZGF0YSwgZm9jdXNEb21haW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9jdXNEb21haW4gPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkLnRpbWU7fSk7XG4gICAgICAgIGZpbHRlcmVkRGF0YSA9IGRhdGE7XG4gICAgICB9IFxuXG4gICAgICBmb2N1cy5icnVzaERvbWFpbihmb2N1c0RvbWFpbik7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgICAgZDMuc2VsZWN0KCd0YWJsZScpLnJlbW92ZSgpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNkYXRhLXRhYmxlJylcbiAgICAgICAgLmRhdHVtKGZpbHRlcmVkRGF0YSlcbiAgICAgICAgLmNhbGwoZGF0YVRhYmxlKTtcblxuICAgICAgZDMuc2VsZWN0KCcjY29udGV4dCcpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChjb250ZXh0KTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIHZhciBicnVzaEV4dGVudCA9IGJydXNoLmV4dGVudCgpO1xuICAgICAgYnJ1c2hlZCgpO1xuICAgICAgZDMuc2VsZWN0KCcuYnJ1c2gnKS5jYWxsKGJydXNoLmV4dGVudChicnVzaEV4dGVudCkpO1xuICAgIH1cblxuXG5cbiAgICAvL1NjYWxlIGNoYXJ0cyBvbiByZXNpemVcbiAgICBkMy5zZWxlY3Qod2luZG93KS5vbigncmVzaXplJywgcmVzaXplKTtcblxuICAgIGZ1bmN0aW9uIHJlc2l6ZSgpIHtcbiAgICAgIHdpZHRoID0gcGFyc2VJbnQoZDMuc2VsZWN0KCcuY29udGVudC1jb250YWluZXInKS5zdHlsZSgnd2lkdGgnKSk7XG4gICAgICBcbiAgICAgIGZvY3VzLndpZHRoKHdpZHRoKTtcbiAgICAgIGNvbnRleHQud2lkdGgod2lkdGgpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChmb2N1cyk7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRleHQnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoY29udGV4dCk7XG4gICAgfVxuXG4gIH0pO1xuXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcblxuZnVuY3Rpb24gbGluZUNoYXJ0KCkge1xuXG4gIHZhciBzdmc7XG4gIHZhciBnRW50ZXI7XG4gIHZhciBnO1xuICB2YXIgZGF0YSA9IFtdXG5cbiAgLy9EZWZhdWx0IGNvbmZpZ1xuICB2YXIgbWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogNDB9O1xuICB2YXIgd2lkdGggPSA5NjA7XG4gIHZhciBoZWlnaHQgPSA1MDA7XG4gIHZhciB4VmFsdWUgPSBmdW5jdGlvbihkKSB7IHJldHVybiBkWzBdOyB9O1xuICB2YXIgeVZhbHVlID0gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFsxXTsgfTtcbiAgdmFyIHggPSBkMy50aW1lLnNjYWxlKCkucmFuZ2UoWzAsIHdpZHRoXSk7XG4gIHZhciB5ID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoW2hlaWdodCwgMF0pO1xuICB2YXIgeFNjYWxlID0gZDMudGltZS5zY2FsZSgpO1xuICB2YXIgeVNjYWxlID0gZDMuc2NhbGUubGluZWFyKCk7XG4gIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeFNjYWxlKS5vcmllbnQoJ2JvdHRvbScpO1xuICB2YXIgbGluZSA9IGQzLnN2Zy5saW5lKCkueChYKS55KFkpO1xuICB2YXIgeVBhZGRpbmcgPSAwLjAyNTtcblxuICAvL09wdGlvbmFsXG4gIHZhciBicnVzaERvbWFpbjtcbiAgdmFyIGFwcGVuZEJydXNoID0gZmFsc2U7XG4gIHZhciBhcHBlbmRZQXhpcyA9IGZhbHNlO1xuICB2YXIgeUF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHlTY2FsZSkub3JpZW50KCdsZWZ0Jyk7XG4gIHZhciBhcHBlbmREYXRhUG9pbnRzID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gY2hhcnQoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblxuICAgICAgLy8gQ29udmVydCBkYXRhIHRvIHN0YW5kYXJkIHJlcHJlc2VudGF0aW9uIGdyZWVkaWx5O1xuICAgICAgLy8gdGhpcyBpcyBuZWVkZWQgZm9yIG5vbmRldGVybWluaXN0aWMgYWNjZXNzb3JzLlxuICAgICAgZGF0YSA9IHJlc3BvbnNlLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHJldHVybiBbeFZhbHVlLmNhbGwoZGF0YSwgZCwgaSksIHlWYWx1ZS5jYWxsKGRhdGEsIGQsIGkpXTtcbiAgICAgIH0pO1xuXG4gICAgICB1cGRhdGVYU2NhbGUoKTtcbiAgICAgIHVwZGF0ZVlTY2FsZSgpO1xuICAgICAgY3JlYXRlU2tlbGV0b24odGhpcyk7XG4gICAgICB1cGRhdGVEaW1lbnNpb25zKCk7XG4gICAgICB1cGRhdGVMaW5lKCk7XG4gICAgICB1cGRhdGVYQXhpcygpO1xuXG4gICAgICBpZihhcHBlbmRZQXhpcyA9PT0gdHJ1ZSkgeyB1cGRhdGVZQXhpcygpOyB9O1xuICAgICAgaWYoYXBwZW5kRGF0YVBvaW50cyA9PT0gdHJ1ZSkgeyB1cGRhdGVEYXRhUG9pbnRzKCk7IH07XG5cbiAgICAgIGFwcGVuZENsaXAoKTtcblxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVYU2NhbGUoKSB7XG4gICAgaWYoYnJ1c2hEb21haW4pIHtcbiAgICAgIHhTY2FsZVxuICAgICAgICAuZG9tYWluKGJydXNoRG9tYWluKVxuICAgICAgICAucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgeFNjYWxlXG4gICAgICAgIC5kb21haW4oZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFswXTsgfSkpXG4gICAgICAgIC5yYW5nZShbMCwgd2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodF0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVlTY2FsZSgpIHtcbiAgICB2YXIgeUV4dGVudCA9IGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7cmV0dXJuIGRbMV07IH0pO1xuICAgIHZhciB5TWluID0geUV4dGVudFswXSAqICgxIC0geVBhZGRpbmcpO1xuICAgIHZhciB5TWF4ID0geUV4dGVudFsxXSAqICgxICsgeVBhZGRpbmcpO1xuXG4gICAgeVNjYWxlXG4gICAgICAuZG9tYWluKFt5TWluLCB5TWF4XSlcbiAgICAgIC5yYW5nZShbaGVpZ2h0IC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b20sIDBdKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNrZWxldG9uKHNlbGVjdGlvbikge1xuICAgIC8vU2VsZWN0IHRoZSBzdmcgZWxlbWVudCBpZiBpdCBleGlzdHNcbiAgICBzdmcgPSBkMy5zZWxlY3Qoc2VsZWN0aW9uKS5zZWxlY3RBbGwoJ3N2ZycpLmRhdGEoW2RhdGFdKTtcblxuICAgIC8vT3RoZXJ3aXNlLCBjcmVhdGUgdGhlIHNrZWxldGFsIGNoYXJ0XG4gICAgZ0VudGVyID0gc3ZnLmVudGVyKCkuYXBwZW5kKCdzdmcnKS5hcHBlbmQoJ2cnKTtcbiAgICBnRW50ZXIuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnbGluZScpO1xuICAgIGdFbnRlci5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICd4IGF4aXMnKTtcbiAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneSBheGlzJyk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVEaW1lbnNpb25zKCkge1xuICAgIC8vdXBkYXRlIHRoZSBvdXRlciBkaW1lbnNpb25zXG4gICAgc3ZnXG4gICAgICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpO1xuXG4gICAgLy91cGRhdGUgdGhlIGlubmVyIGRpbWVuc2lvbnNcbiAgICBnID0gc3ZnLnNlbGVjdCgnZycpXG4gICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKVxuICB9XG5cbiAgZnVuY3Rpb24gYXBwZW5kQ2xpcCgpIHtcbiAgICAvL0FkZCBjbGlwIHBhdGggc28gZGF0YSBkb2Vzbid0IGNyb3NzIGF4aXNcbiAgICBzdmcuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJjbGlwUGF0aFwiKVxuICAgICAgICAuYXR0cihcImlkXCIsIFwiY2xpcFwiKVxuICAgICAgLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmUoKSB7XG4gICAgZy5zZWxlY3QoJy5saW5lJylcbiAgICAgIC5hdHRyKCdkJywgbGluZSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVYQXhpcygpIHtcbiAgICBnLnNlbGVjdCgnLnguYXhpcycpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgeVNjYWxlLnJhbmdlKClbMF0gKyBcIilcIilcbiAgICAgIC5jYWxsKHhBeGlzKTsgICAgXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVZQXhpcygpIHtcbiAgICBnLnNlbGVjdCgnLnkuYXhpcycpXG4gICAgICAuY2FsbCh5QXhpcyk7ICAgIFxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlRGF0YVBvaW50cygpIHtcbiAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAncG9pbnRzJyk7XG5cbiAgICBnLnNlbGVjdCgnZy5wb2ludHMnKVxuICAgICAgLnNlbGVjdEFsbCgnY2lyY2xlLnBvaW50JylcbiAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAuZW50ZXIoKVxuICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdwb2ludCcpXG4gICAgICAuYXR0cigncicsIDMuNSk7XG5cbiAgICBnLnNlbGVjdEFsbCgnY2lyY2xlLnBvaW50JylcbiAgICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHhTY2FsZShkWzBdKTsgfSlcbiAgICAgIC5hdHRyKCdjeScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHlTY2FsZShkWzFdKTsgfSk7XG4gIH1cblxuICAvLyBUaGUgeC1hY2Nlc3NvciBmb3IgdGhlIHBhdGggZ2VuZXJhdG9yOyB4U2NhbGUg4oiYIHhWYWx1ZS5cbiAgZnVuY3Rpb24gWChkKSB7XG4gICAgcmV0dXJuIHhTY2FsZShkWzBdKTtcbiAgfVxuXG4gIC8vIFRoZSB4LWFjY2Vzc29yIGZvciB0aGUgcGF0aCBnZW5lcmF0b3I7IHlTY2FsZSDiiJggeVZhbHVlLlxuICBmdW5jdGlvbiBZKGQpIHtcbiAgICByZXR1cm4geVNjYWxlKGRbMV0pO1xuICB9XG5cbiAgLy9HZXR0ZXJzIGFuZCBzZXR0ZXJzXG4gIGNoYXJ0Lm1hcmdpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1hcmdpbjtcbiAgICBtYXJnaW4gPSBfO1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBjaGFydC53aWR0aCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB3aWR0aDtcbiAgICB3aWR0aCA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQuaGVpZ2h0ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGhlaWdodDtcbiAgICBoZWlnaHQgPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LnggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geFZhbHVlO1xuICAgIHhWYWx1ZSA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQueSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5VmFsdWU7XG4gICAgeVZhbHVlID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC5hcHBlbmRZQXhpcyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGFwcGVuZFlBeGlzO1xuICAgIGFwcGVuZFlBeGlzID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC5hcHBlbmREYXRhUG9pbnRzID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYXBwZW5kRGF0YVBvaW50cztcbiAgICBhcHBlbmREYXRhUG9pbnRzID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC54U2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4U2NhbGU7XG4gICAgeFNjYWxlID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC5icnVzaERvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJydXNoRG9tYWluO1xuICAgIGJydXNoRG9tYWluID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC55UGFkZGluZyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHlQYWRkaW5nO1xuICAgIHlQYWRkaW5nID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICByZXR1cm4gY2hhcnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGluZUNoYXJ0OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcblxuZnVuY3Rpb24gdGFidWxhdGUoKSB7XG5cbiAgZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyg/Ol58XFxzKVxcUy9nLCBmdW5jdGlvbihhKSB7IHJldHVybiBhLnRvVXBwZXJDYXNlKCk7IH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFibGUoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAvL0NyZWF0ZSBhcnJheSBvZiBjb2x1bW5zIGZyb20gZGF0YSBrZXlzXG4gICAgICB2YXIgY29sdW1ucyA9IFtdO1xuICAgICAgdmFyIGRhdGFTYW1wbGUgPSBkYXRhWzBdO1xuXG4gICAgICBmb3IodmFyIGtleSBpbiBkYXRhU2FtcGxlKSB7XG4gICAgICAgIGNvbHVtbnMucHVzaChrZXkpO1xuICAgICAgfVxuXG4gICAgICAvL0NyZWF0ZSBhcnJheSBvZiBkYXRhXG4gICAgICB2YXIgY2VsbERhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICAgIHJldHVybiB7Y29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXX07XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vU2VsZWN0IHRoZSBzdmcgZWxlbWVudCBpZiBpdCBleGlzdHNcbiAgICAgIHZhciB0YWJsZSA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RhYmxlJykuZGF0YShbZGF0YV0pO1xuXG4gICAgICB2YXIgdEVudGVyID0gdGFibGUuZW50ZXIoKS5hcHBlbmQoJ3RhYmxlJyk7XG4gICAgICB2YXIgdGhlYWQgPSB0RW50ZXIuYXBwZW5kKCd0aGVhZCcpO1xuICAgICAgdmFyIHRib2R5ID0gdEVudGVyLmFwcGVuZCgndGJvZHknKTtcblxuXG4gICAgICAvL0FwcGVuZCBoZWFkZXIgcm93XG4gICAgICB0aGVhZC5hcHBlbmQoJ3RyJylcbiAgICAgICAgLnNlbGVjdEFsbCgndGgnKVxuICAgICAgICAuZGF0YShjb2x1bW5zKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0aCcpXG4gICAgICAgIC50ZXh0KGZ1bmN0aW9uKGNvbHVtbikge3JldHVybiBjYXBpdGFsaXplKGNvbHVtbik7fSk7XG5cblxuICAgICAgLy9DcmVhdGUgUm93c1xuICAgICAgdmFyIHJvd3MgPSB0Ym9keS5zZWxlY3RBbGwoJ3RyJylcbiAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgndHInKTtcblxuICAgICAgLy9DcmVhdGUgY2VsbHMgaW4gZWFjaCByb3cgZm9yIGVhY2ggY29sdW1uXG4gICAgICB2YXIgY2VsbHMgPSByb3dzLnNlbGVjdEFsbCgndGQnKVxuICAgICAgICAuZGF0YShmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm4ge2NvbHVtbjogY29sdW1uLCB2YWx1ZTogcm93W2NvbHVtbl19O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0ZCcpXG4gICAgICAgIC5odG1sKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudmFsdWU7IH0pO1xuICAgIH0pO1xuXG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGFidWxhdGU7XG5cblxuIiwidmFyIGlvID0gcmVxdWlyZSgnc29ja2V0LmlvLWNsaWVudCcpO1xudmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuXG5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byB3ZWJzb2NrZXRzJyk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzb2NrZXQ7XG5cblxuIl19
