(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
// require('./charts.js')();
require('./d3-charts.js')();
},{"./d3-charts.js":3}],2:[function(require,module,exports){
'use strict';
var d3 = require('d3');

var b3 = {
  parsePrice: function(price) {
    var parsedPrice = {};
    parsedPrice.time = new Date(price.time);
    parsedPrice.price = +price.lastPrice;

    return parsedPrice;
  }
}

module.exports = b3;
},{"d3":"d3"}],3:[function(require,module,exports){
//Adapted from http://bl.ocks.org/mbostock/1667367
'use strict';

var d3 = require('d3');
var b3 = require('./b3.js');
// var lineChart = require('./linechart.js');
var lineChart = require('./linechart.js');
var tabulate = require('./table.js');
var io = require('./websockets.js');



module.exports = function() {

  var width = parseInt(d3.select('.content-container').style('width'));

  d3.json('/prices', function(err, data) {
    data = data.prices.map(b3.parsePrice);

    //Update on new price sent via websockets
    io.on('price', function(price) {
      var newPrice = b3.parsePrice(price);

      if(JSON.stringify(newPrice) !== JSON.stringify(data[data.length - 1])) {
        console.log(newPrice);
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


    //Filters time data given a date range  
    function filterDataByDateRange(data, extent) {
        var timeMin = extent[0];
        var timeMax = extent[1];

        return data.filter(function(datum) {
          var timeMin = brush.extent()[0];
          var timeMax = brush.extent()[1];
          return datum.time >= timeMin && datum.time <= timeMax;
        });
    }

    //Update charts on brush
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

      //Clip to prevent overlapping axis
      d3.selectAll('.line').attr('clip-path', 'url(#clip)')
      d3.selectAll('circle.point').attr('clip-path', 'url(#clip)')


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
},{"./b3.js":2,"./linechart.js":4,"./table.js":5,"./websockets.js":6,"d3":"d3"}],4:[function(require,module,exports){
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
  var yAxis = d3.svg.axis().scale(yScale).orient('left');
  var line = d3.svg.line().x(X).y(Y);
  var yPadding = 0.025;

  //Optional
  var brushDomain;
  var appendBrush = false;
  var appendYAxis = false;
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

    if(appendYAxis === true) {
      gEnter.append('g').attr('class', 'y axis');   
    }
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
},{"d3":"d3"}],5:[function(require,module,exports){
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
        .attr('class', 'header-row')
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



},{"d3":"d3"}],6:[function(require,module,exports){
var io = require('socket.io-client');
var socket = io.connect('http://localhost:4000');

socket.on('connect', function() {
  console.log('connected to websockets');
});

module.exports = socket;



},{"socket.io-client":"socket.io-client"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9iMy5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvbGluZWNoYXJ0LmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3RhYmxlLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3dlYnNvY2tldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHJlcXVpcmUoJy4vY2hhcnQuanMnKSgpO1xuLy8gcmVxdWlyZSgnLi9jaGFydHMuanMnKSgpO1xucmVxdWlyZSgnLi9kMy1jaGFydHMuanMnKSgpOyIsIid1c2Ugc3RyaWN0JztcbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbnZhciBiMyA9IHtcbiAgcGFyc2VQcmljZTogZnVuY3Rpb24ocHJpY2UpIHtcbiAgICB2YXIgcGFyc2VkUHJpY2UgPSB7fTtcbiAgICBwYXJzZWRQcmljZS50aW1lID0gbmV3IERhdGUocHJpY2UudGltZSk7XG4gICAgcGFyc2VkUHJpY2UucHJpY2UgPSArcHJpY2UubGFzdFByaWNlO1xuXG4gICAgcmV0dXJuIHBhcnNlZFByaWNlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYjM7IiwiLy9BZGFwdGVkIGZyb20gaHR0cDovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzE2NjczNjdcbid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcbnZhciBiMyA9IHJlcXVpcmUoJy4vYjMuanMnKTtcbi8vIHZhciBsaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2xpbmVjaGFydC5qcycpO1xudmFyIGxpbmVDaGFydCA9IHJlcXVpcmUoJy4vbGluZWNoYXJ0LmpzJyk7XG52YXIgdGFidWxhdGUgPSByZXF1aXJlKCcuL3RhYmxlLmpzJyk7XG52YXIgaW8gPSByZXF1aXJlKCcuL3dlYnNvY2tldHMuanMnKTtcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHdpZHRoID0gcGFyc2VJbnQoZDMuc2VsZWN0KCcuY29udGVudC1jb250YWluZXInKS5zdHlsZSgnd2lkdGgnKSk7XG5cbiAgZDMuanNvbignL3ByaWNlcycsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhLnByaWNlcy5tYXAoYjMucGFyc2VQcmljZSk7XG5cbiAgICAvL1VwZGF0ZSBvbiBuZXcgcHJpY2Ugc2VudCB2aWEgd2Vic29ja2V0c1xuICAgIGlvLm9uKCdwcmljZScsIGZ1bmN0aW9uKHByaWNlKSB7XG4gICAgICB2YXIgbmV3UHJpY2UgPSBiMy5wYXJzZVByaWNlKHByaWNlKTtcblxuICAgICAgaWYoSlNPTi5zdHJpbmdpZnkobmV3UHJpY2UpICE9PSBKU09OLnN0cmluZ2lmeShkYXRhW2RhdGEubGVuZ3RoIC0gMV0pKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKG5ld1ByaWNlKTtcbiAgICAgICAgZGF0YS5wdXNoKG5ld1ByaWNlKTtcbiAgICAgICAgdXBkYXRlKCk7ICAgICAgICBcbiAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgLy9DcmVhdGUgbWFjcm8gY2hhcnRcbiAgICB2YXIgY29udGV4dCA9IGxpbmVDaGFydCgpICAgIFxuICAgICAgLngoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50aW1lOyB9KVxuICAgICAgLnkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5wcmljZTsgfSlcbiAgICAgIC55UGFkZGluZygwLjAxKVxuICAgICAgLmhlaWdodCgxMDApXG4gICAgICAud2lkdGgod2lkdGgpO1xuXG4gICAgLy9DcmVhdGUgZmlsdGVyZWQgY2hhcnRcbiAgICB2YXIgZm9jdXMgPSBsaW5lQ2hhcnQoKVxuICAgICAgLngoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50aW1lOyB9KVxuICAgICAgLnkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5wcmljZTsgfSlcbiAgICAgIC53aWR0aCh3aWR0aClcbiAgICAgIC5tYXJnaW4oe3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAzMCwgbGVmdDogNDB9KVxuICAgICAgLmFwcGVuZFlBeGlzKHRydWUpXG4gICAgICAuYXBwZW5kRGF0YVBvaW50cyh0cnVlKTtcblxuICAgIC8vUmVuZGVyIG1hY3JvIGNoYXJ0XG4gICAgZDMuc2VsZWN0KCcjY29udGV4dCcpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGNvbnRleHQpO1xuXG4gICAgLy9SZW5kZXIgZmlsdGVyZWQgY2hhcnRcbiAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgIC8vQWRkaW5nIGJydXNoIHRvIHRoZSBjb250ZXh0IGNoYXJ0XG4gICAgdmFyIGJydXNoID0gZDMuc3ZnLmJydXNoKClcbiAgICAgIC54KGNvbnRleHQueFNjYWxlKCkpXG4gICAgICAub24oJ2JydXNoJywgYnJ1c2hlZCk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb250ZXh0IHN2ZycpXG4gICAgICAuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGJydXNoXCIpXG4gICAgICAuY2FsbChicnVzaClcbiAgICAgIC5zZWxlY3RBbGwoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcInlcIiwgLTYpXG4gICAgICAuYXR0cihcImhlaWdodFwiLCBjb250ZXh0LmhlaWdodCgpICsgNylcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb250ZXh0Lm1hcmdpbigpLmxlZnQgKyAnLDApJyk7XG5cbiAgICAvL0NyZWF0ZSBhbmQgYXBwZW5kIGRhdGEgdGFibGVcbiAgICB2YXIgZGF0YVRhYmxlID0gdGFidWxhdGUoKTtcblxuICAgIGQzLnNlbGVjdCgnI2RhdGEtdGFibGUnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuY2FsbChkYXRhVGFibGUpO1xuXG5cbiAgICAvL0ZpbHRlcnMgdGltZSBkYXRhIGdpdmVuIGEgZGF0ZSByYW5nZSAgXG4gICAgZnVuY3Rpb24gZmlsdGVyRGF0YUJ5RGF0ZVJhbmdlKGRhdGEsIGV4dGVudCkge1xuICAgICAgICB2YXIgdGltZU1pbiA9IGV4dGVudFswXTtcbiAgICAgICAgdmFyIHRpbWVNYXggPSBleHRlbnRbMV07XG5cbiAgICAgICAgcmV0dXJuIGRhdGEuZmlsdGVyKGZ1bmN0aW9uKGRhdHVtKSB7XG4gICAgICAgICAgdmFyIHRpbWVNaW4gPSBicnVzaC5leHRlbnQoKVswXTtcbiAgICAgICAgICB2YXIgdGltZU1heCA9IGJydXNoLmV4dGVudCgpWzFdO1xuICAgICAgICAgIHJldHVybiBkYXR1bS50aW1lID49IHRpbWVNaW4gJiYgZGF0dW0udGltZSA8PSB0aW1lTWF4O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvL1VwZGF0ZSBjaGFydHMgb24gYnJ1c2hcbiAgICBmdW5jdGlvbiBicnVzaGVkKCkge1xuICAgICAgdmFyIGZvY3VzRG9tYWluO1xuICAgICAgdmFyIGZpbHRlcmVkRGF0YTtcblxuICAgICAgaWYoIWJydXNoLmVtcHR5KCkpIHtcbiAgICAgICAgZm9jdXNEb21haW4gPSBicnVzaC5leHRlbnQoKTtcbiAgICAgICAgZmlsdGVyZWREYXRhID0gZmlsdGVyRGF0YUJ5RGF0ZVJhbmdlKGRhdGEsIGZvY3VzRG9tYWluKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvY3VzRG9tYWluID0gZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC50aW1lO30pO1xuICAgICAgICBmaWx0ZXJlZERhdGEgPSBkYXRhO1xuICAgICAgfSBcblxuICAgICAgLy9DbGlwIHRvIHByZXZlbnQgb3ZlcmxhcHBpbmcgYXhpc1xuICAgICAgZDMuc2VsZWN0QWxsKCcubGluZScpLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoI2NsaXApJylcbiAgICAgIGQzLnNlbGVjdEFsbCgnY2lyY2xlLnBvaW50JykuYXR0cignY2xpcC1wYXRoJywgJ3VybCgjY2xpcCknKVxuXG5cbiAgICAgIGZvY3VzLmJydXNoRG9tYWluKGZvY3VzRG9tYWluKTtcblxuICAgICAgZDMuc2VsZWN0KCcjZm9jdXMnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoZm9jdXMpO1xuXG4gICAgICBkMy5zZWxlY3QoJ3RhYmxlJykucmVtb3ZlKCk7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2RhdGEtdGFibGUnKVxuICAgICAgICAuZGF0dW0oZmlsdGVyZWREYXRhKVxuICAgICAgICAuY2FsbChkYXRhVGFibGUpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZXh0JylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGNvbnRleHQpO1xuXG4gICAgfVxuXG4gICAgLy9VcGRhdGUgY2hhcnRzIGFuZCBicnVzaCBvbiBuZXcgZGF0YVxuICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgIHZhciBicnVzaEV4dGVudCA9IGJydXNoLmV4dGVudCgpO1xuICAgICAgYnJ1c2hlZCgpO1xuICAgICAgZDMuc2VsZWN0KCcuYnJ1c2gnKS5jYWxsKGJydXNoLmV4dGVudChicnVzaEV4dGVudCkpO1xuICAgIH1cblxuXG5cbiAgICAvL1NjYWxlIGNoYXJ0cyBvbiByZXNpemVcbiAgICBkMy5zZWxlY3Qod2luZG93KS5vbigncmVzaXplJywgcmVzaXplKTtcblxuICAgIGZ1bmN0aW9uIHJlc2l6ZSgpIHtcbiAgICAgIHdpZHRoID0gcGFyc2VJbnQoZDMuc2VsZWN0KCcuY29udGVudC1jb250YWluZXInKS5zdHlsZSgnd2lkdGgnKSk7XG4gICAgICBcbiAgICAgIGZvY3VzLndpZHRoKHdpZHRoKTtcbiAgICAgIGNvbnRleHQud2lkdGgod2lkdGgpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChmb2N1cyk7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRleHQnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoY29udGV4dCk7XG4gICAgfVxuXG4gIH0pO1xuXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcblxuZnVuY3Rpb24gbGluZUNoYXJ0KCkge1xuXG4gIHZhciBzdmc7XG4gIHZhciBnRW50ZXI7XG4gIHZhciBnO1xuICB2YXIgZGF0YSA9IFtdXG5cbiAgLy9EZWZhdWx0IGNvbmZpZ1xuICB2YXIgbWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogNDB9O1xuICB2YXIgd2lkdGggPSA5NjA7XG4gIHZhciBoZWlnaHQgPSA1MDA7XG4gIHZhciB4VmFsdWUgPSBmdW5jdGlvbihkKSB7IHJldHVybiBkWzBdOyB9O1xuICB2YXIgeVZhbHVlID0gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFsxXTsgfTtcbiAgdmFyIHggPSBkMy50aW1lLnNjYWxlKCkucmFuZ2UoWzAsIHdpZHRoXSk7XG4gIHZhciB5ID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoW2hlaWdodCwgMF0pO1xuICB2YXIgeFNjYWxlID0gZDMudGltZS5zY2FsZSgpO1xuICB2YXIgeVNjYWxlID0gZDMuc2NhbGUubGluZWFyKCk7XG4gIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeFNjYWxlKS5vcmllbnQoJ2JvdHRvbScpO1xuICB2YXIgeUF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHlTY2FsZSkub3JpZW50KCdsZWZ0Jyk7XG4gIHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKS54KFgpLnkoWSk7XG4gIHZhciB5UGFkZGluZyA9IDAuMDI1O1xuXG4gIC8vT3B0aW9uYWxcbiAgdmFyIGJydXNoRG9tYWluO1xuICB2YXIgYXBwZW5kQnJ1c2ggPSBmYWxzZTtcbiAgdmFyIGFwcGVuZFlBeGlzID0gZmFsc2U7XG4gIHZhciBhcHBlbmREYXRhUG9pbnRzID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gY2hhcnQoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblxuICAgICAgLy8gQ29udmVydCBkYXRhIHRvIHN0YW5kYXJkIHJlcHJlc2VudGF0aW9uIGdyZWVkaWx5O1xuICAgICAgLy8gdGhpcyBpcyBuZWVkZWQgZm9yIG5vbmRldGVybWluaXN0aWMgYWNjZXNzb3JzLlxuICAgICAgZGF0YSA9IHJlc3BvbnNlLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHJldHVybiBbeFZhbHVlLmNhbGwoZGF0YSwgZCwgaSksIHlWYWx1ZS5jYWxsKGRhdGEsIGQsIGkpXTtcbiAgICAgIH0pO1xuXG4gICAgICB1cGRhdGVYU2NhbGUoKTtcbiAgICAgIHVwZGF0ZVlTY2FsZSgpO1xuICAgICAgY3JlYXRlU2tlbGV0b24odGhpcyk7XG4gICAgICB1cGRhdGVEaW1lbnNpb25zKCk7XG4gICAgICB1cGRhdGVMaW5lKCk7XG4gICAgICB1cGRhdGVYQXhpcygpO1xuXG4gICAgICBpZihhcHBlbmRZQXhpcyA9PT0gdHJ1ZSkgeyB1cGRhdGVZQXhpcygpOyB9O1xuICAgICAgaWYoYXBwZW5kRGF0YVBvaW50cyA9PT0gdHJ1ZSkgeyB1cGRhdGVEYXRhUG9pbnRzKCk7IH07XG5cbiAgICAgIGFwcGVuZENsaXAoKTtcblxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVYU2NhbGUoKSB7XG4gICAgaWYoYnJ1c2hEb21haW4pIHtcbiAgICAgIHhTY2FsZVxuICAgICAgICAuZG9tYWluKGJydXNoRG9tYWluKVxuICAgICAgICAucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgeFNjYWxlXG4gICAgICAgIC5kb21haW4oZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFswXTsgfSkpXG4gICAgICAgIC5yYW5nZShbMCwgd2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodF0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVlTY2FsZSgpIHtcbiAgICB2YXIgeUV4dGVudCA9IGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7cmV0dXJuIGRbMV07IH0pO1xuICAgIHZhciB5TWluID0geUV4dGVudFswXSAqICgxIC0geVBhZGRpbmcpO1xuICAgIHZhciB5TWF4ID0geUV4dGVudFsxXSAqICgxICsgeVBhZGRpbmcpO1xuXG4gICAgeVNjYWxlXG4gICAgICAuZG9tYWluKFt5TWluLCB5TWF4XSlcbiAgICAgIC5yYW5nZShbaGVpZ2h0IC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b20sIDBdKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNrZWxldG9uKHNlbGVjdGlvbikge1xuICAgIC8vU2VsZWN0IHRoZSBzdmcgZWxlbWVudCBpZiBpdCBleGlzdHNcbiAgICBzdmcgPSBkMy5zZWxlY3Qoc2VsZWN0aW9uKS5zZWxlY3RBbGwoJ3N2ZycpLmRhdGEoW2RhdGFdKTtcblxuICAgIC8vT3RoZXJ3aXNlLCBjcmVhdGUgdGhlIHNrZWxldGFsIGNoYXJ0XG4gICAgZ0VudGVyID0gc3ZnLmVudGVyKCkuYXBwZW5kKCdzdmcnKS5hcHBlbmQoJ2cnKTtcbiAgICBnRW50ZXIuYXBwZW5kKCdwYXRoJykuYXR0cignY2xhc3MnLCAnbGluZScpO1xuICAgIGdFbnRlci5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICd4IGF4aXMnKTtcblxuICAgIGlmKGFwcGVuZFlBeGlzID09PSB0cnVlKSB7XG4gICAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneSBheGlzJyk7ICAgXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlRGltZW5zaW9ucygpIHtcbiAgICAvL3VwZGF0ZSB0aGUgb3V0ZXIgZGltZW5zaW9uc1xuICAgIHN2Z1xuICAgICAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gICAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICAgIC8vdXBkYXRlIHRoZSBpbm5lciBkaW1lbnNpb25zXG4gICAgZyA9IHN2Zy5zZWxlY3QoJ2cnKVxuICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIilcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGVuZENsaXAoKSB7XG4gICAgLy9BZGQgY2xpcCBwYXRoIHNvIGRhdGEgZG9lc24ndCBjcm9zcyBheGlzXG4gICAgc3ZnLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwiY2xpcFBhdGhcIilcbiAgICAgICAgLmF0dHIoXCJpZFwiLCBcImNsaXBcIilcbiAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVMaW5lKCkge1xuICAgIGcuc2VsZWN0KCcubGluZScpXG4gICAgICAuYXR0cignZCcsIGxpbmUpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlWEF4aXMoKSB7XG4gICAgZy5zZWxlY3QoJy54LmF4aXMnKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIHlTY2FsZS5yYW5nZSgpWzBdICsgXCIpXCIpXG4gICAgICAuY2FsbCh4QXhpcyk7ICAgIFxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlWUF4aXMoKSB7XG4gICAgZy5zZWxlY3QoJy55LmF4aXMnKVxuICAgICAgLmNhbGwoeUF4aXMpOyAgICBcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZURhdGFQb2ludHMoKSB7XG4gICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3BvaW50cycpO1xuXG4gICAgZy5zZWxlY3QoJ2cucG9pbnRzJylcbiAgICAgIC5zZWxlY3RBbGwoJ2NpcmNsZS5wb2ludCcpXG4gICAgICAuZGF0YShkYXRhKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAuYXR0cignY2xhc3MnLCAncG9pbnQnKVxuICAgICAgLmF0dHIoJ3InLCAzLjUpO1xuXG4gICAgZy5zZWxlY3RBbGwoJ2NpcmNsZS5wb2ludCcpXG4gICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7IHJldHVybiB4U2NhbGUoZFswXSk7IH0pXG4gICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7IHJldHVybiB5U2NhbGUoZFsxXSk7IH0pO1xuICB9XG5cbiAgLy8gVGhlIHgtYWNjZXNzb3IgZm9yIHRoZSBwYXRoIGdlbmVyYXRvcjsgeFNjYWxlIOKImCB4VmFsdWUuXG4gIGZ1bmN0aW9uIFgoZCkge1xuICAgIHJldHVybiB4U2NhbGUoZFswXSk7XG4gIH1cblxuICAvLyBUaGUgeC1hY2Nlc3NvciBmb3IgdGhlIHBhdGggZ2VuZXJhdG9yOyB5U2NhbGUg4oiYIHlWYWx1ZS5cbiAgZnVuY3Rpb24gWShkKSB7XG4gICAgcmV0dXJuIHlTY2FsZShkWzFdKTtcbiAgfVxuXG4gIC8vR2V0dGVycyBhbmQgc2V0dGVyc1xuICBjaGFydC5tYXJnaW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtYXJnaW47XG4gICAgbWFyZ2luID0gXztcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgY2hhcnQud2lkdGggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gd2lkdGg7XG4gICAgd2lkdGggPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LmhlaWdodCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBoZWlnaHQ7XG4gICAgaGVpZ2h0ID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC54ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHhWYWx1ZTtcbiAgICB4VmFsdWUgPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LnkgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geVZhbHVlO1xuICAgIHlWYWx1ZSA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQuYXBwZW5kWUF4aXMgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBhcHBlbmRZQXhpcztcbiAgICBhcHBlbmRZQXhpcyA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQuYXBwZW5kRGF0YVBvaW50cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGFwcGVuZERhdGFQb2ludHM7XG4gICAgYXBwZW5kRGF0YVBvaW50cyA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQueFNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geFNjYWxlO1xuICAgIHhTY2FsZSA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQuYnJ1c2hEb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBicnVzaERvbWFpbjtcbiAgICBicnVzaERvbWFpbiA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQueVBhZGRpbmcgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5UGFkZGluZztcbiAgICB5UGFkZGluZyA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcmV0dXJuIGNoYXJ0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpbmVDaGFydDsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbmZ1bmN0aW9uIHRhYnVsYXRlKCkge1xuXG4gIGZ1bmN0aW9uIGNhcGl0YWxpemUoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8oPzpefFxccylcXFMvZywgZnVuY3Rpb24oYSkgeyByZXR1cm4gYS50b1VwcGVyQ2FzZSgpOyB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRhYmxlKHNlbGVjdGlvbikge1xuICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgLy9DcmVhdGUgYXJyYXkgb2YgY29sdW1ucyBmcm9tIGRhdGEga2V5c1xuICAgICAgdmFyIGNvbHVtbnMgPSBbXTtcbiAgICAgIHZhciBkYXRhU2FtcGxlID0gZGF0YVswXTtcblxuICAgICAgZm9yKHZhciBrZXkgaW4gZGF0YVNhbXBsZSkge1xuICAgICAgICBjb2x1bW5zLnB1c2goa2V5KTtcbiAgICAgIH1cblxuICAgICAgLy9DcmVhdGUgYXJyYXkgb2YgZGF0YVxuICAgICAgdmFyIGNlbGxEYXRhID0gZGF0YS5tYXAoZnVuY3Rpb24ocm93KSB7XG4gICAgICAgIHJldHVybiBjb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4pIHtcbiAgICAgICAgICByZXR1cm4ge2NvbHVtbjogY29sdW1uLCB2YWx1ZTogcm93W2NvbHVtbl19O1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICAvL1NlbGVjdCB0aGUgc3ZnIGVsZW1lbnQgaWYgaXQgZXhpc3RzXG4gICAgICB2YXIgdGFibGUgPSBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCd0YWJsZScpLmRhdGEoW2RhdGFdKTtcblxuICAgICAgdmFyIHRFbnRlciA9IHRhYmxlLmVudGVyKCkuYXBwZW5kKCd0YWJsZScpO1xuICAgICAgdmFyIHRoZWFkID0gdEVudGVyLmFwcGVuZCgndGhlYWQnKTtcbiAgICAgIHZhciB0Ym9keSA9IHRFbnRlci5hcHBlbmQoJ3Rib2R5Jyk7XG5cblxuICAgICAgLy9BcHBlbmQgaGVhZGVyIHJvd1xuICAgICAgdGhlYWQuYXBwZW5kKCd0cicpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdoZWFkZXItcm93JylcbiAgICAgICAgLnNlbGVjdEFsbCgndGgnKVxuICAgICAgICAuZGF0YShjb2x1bW5zKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0aCcpXG4gICAgICAgIC50ZXh0KGZ1bmN0aW9uKGNvbHVtbikge3JldHVybiBjYXBpdGFsaXplKGNvbHVtbik7fSk7XG5cblxuICAgICAgLy9DcmVhdGUgUm93c1xuICAgICAgdmFyIHJvd3MgPSB0Ym9keS5zZWxlY3RBbGwoJ3RyJylcbiAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgndHInKTtcblxuICAgICAgLy9DcmVhdGUgY2VsbHMgaW4gZWFjaCByb3cgZm9yIGVhY2ggY29sdW1uXG4gICAgICB2YXIgY2VsbHMgPSByb3dzLnNlbGVjdEFsbCgndGQnKVxuICAgICAgICAuZGF0YShmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7XG4gICAgICAgICAgICByZXR1cm4ge2NvbHVtbjogY29sdW1uLCB2YWx1ZTogcm93W2NvbHVtbl19O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0ZCcpXG4gICAgICAgIC5odG1sKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudmFsdWU7IH0pO1xuICAgIH0pO1xuXG4gIH1cblxuICByZXR1cm4gdGFibGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGFidWxhdGU7XG5cblxuIiwidmFyIGlvID0gcmVxdWlyZSgnc29ja2V0LmlvLWNsaWVudCcpO1xudmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuXG5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byB3ZWJzb2NrZXRzJyk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzb2NrZXQ7XG5cblxuIl19
