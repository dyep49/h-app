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
  },

  filterDataByDateRange: function(data, extent) {
    var timeMin = extent[0];
    var timeMax = extent[1];

    return data.filter(function(datum) {
      return new Date(datum.time) >= timeMin && new Date(datum.time) <= timeMax;
    });
  }
};

module.exports = b3;
},{"d3":"d3"}],3:[function(require,module,exports){
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
},{"./b3.js":2,"./linechart.js":4,"./table.js":5,"./websockets.js":6,"d3":"d3"}],4:[function(require,module,exports){
'use strict';

var d3 = require('d3');

function lineChart() {

  var svg;
  var gEnter;
  var g;
  var data = [];

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

      if(appendYAxis === true) { updateYAxis(); }
      if(appendDataPoints === true) { updateDataPoints(); }

      appendClip();

    });
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
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
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
    return this;
  };

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9iMy5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvbGluZWNoYXJ0LmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3RhYmxlLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3dlYnNvY2tldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHJlcXVpcmUoJy4vY2hhcnQuanMnKSgpO1xuLy8gcmVxdWlyZSgnLi9jaGFydHMuanMnKSgpO1xucmVxdWlyZSgnLi9kMy1jaGFydHMuanMnKSgpOyIsIid1c2Ugc3RyaWN0JztcbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbnZhciBiMyA9IHtcbiAgcGFyc2VQcmljZTogZnVuY3Rpb24ocHJpY2UpIHtcbiAgICB2YXIgcGFyc2VkUHJpY2UgPSB7fTtcbiAgICBwYXJzZWRQcmljZS50aW1lID0gbmV3IERhdGUocHJpY2UudGltZSk7XG4gICAgcGFyc2VkUHJpY2UucHJpY2UgPSArcHJpY2UubGFzdFByaWNlO1xuXG4gICAgcmV0dXJuIHBhcnNlZFByaWNlO1xuICB9LFxuXG4gIGZpbHRlckRhdGFCeURhdGVSYW5nZTogZnVuY3Rpb24oZGF0YSwgZXh0ZW50KSB7XG4gICAgdmFyIHRpbWVNaW4gPSBleHRlbnRbMF07XG4gICAgdmFyIHRpbWVNYXggPSBleHRlbnRbMV07XG5cbiAgICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24oZGF0dW0pIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShkYXR1bS50aW1lKSA+PSB0aW1lTWluICYmIG5ldyBEYXRlKGRhdHVtLnRpbWUpIDw9IHRpbWVNYXg7XG4gICAgfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYjM7IiwiLy9BZGFwdGVkIGZyb20gaHR0cDovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzE2NjczNjdcbid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcbnZhciBiMyA9IHJlcXVpcmUoJy4vYjMuanMnKTtcbnZhciBsaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2xpbmVjaGFydC5qcycpO1xudmFyIHRhYnVsYXRlID0gcmVxdWlyZSgnLi90YWJsZS5qcycpO1xudmFyIGlvID0gcmVxdWlyZSgnLi93ZWJzb2NrZXRzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHdpZHRoID0gcGFyc2VJbnQoZDMuc2VsZWN0KCcuY29udGVudC1jb250YWluZXInKS5zdHlsZSgnd2lkdGgnKSk7XG5cbiAgZDMuanNvbignL3ByaWNlcycsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhLnByaWNlcy5yZXZlcnNlKCkubWFwKGIzLnBhcnNlUHJpY2UpO1xuICAgIC8vVXBkYXRlIG9uIG5ldyBwcmljZSBzZW50IHZpYSB3ZWJzb2NrZXRzXG4gICAgaW8ub24oJ3ByaWNlJywgZnVuY3Rpb24ocHJpY2UpIHtcbiAgICAgIHZhciBuZXdQcmljZSA9IGIzLnBhcnNlUHJpY2UocHJpY2UpO1xuXG4gICAgICBpZihKU09OLnN0cmluZ2lmeShuZXdQcmljZSkgIT09IEpTT04uc3RyaW5naWZ5KGRhdGFbZGF0YS5sZW5ndGggLSAxXSkpIHtcbiAgICAgICAgZGF0YS5wdXNoKG5ld1ByaWNlKTtcbiAgICAgICAgdXBkYXRlKCk7ICAgICAgICBcbiAgICAgIH1cblxuICAgIH0pO1xuXG4gICAgLy9DcmVhdGUgbWFjcm8gY2hhcnRcbiAgICB2YXIgY29udGV4dCA9IGxpbmVDaGFydCgpICAgIFxuICAgICAgLngoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50aW1lOyB9KVxuICAgICAgLnkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5wcmljZTsgfSlcbiAgICAgIC55UGFkZGluZygwLjAxKVxuICAgICAgLmhlaWdodCgxMDApXG4gICAgICAud2lkdGgod2lkdGgpO1xuXG4gICAgLy9DcmVhdGUgZmlsdGVyZWQgY2hhcnRcbiAgICB2YXIgZm9jdXMgPSBsaW5lQ2hhcnQoKVxuICAgICAgLngoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50aW1lOyB9KVxuICAgICAgLnkoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5wcmljZTsgfSlcbiAgICAgIC53aWR0aCh3aWR0aClcbiAgICAgIC5tYXJnaW4oe3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAzMCwgbGVmdDogNDB9KVxuICAgICAgLmFwcGVuZFlBeGlzKHRydWUpXG4gICAgICAuYXBwZW5kRGF0YVBvaW50cyh0cnVlKTtcblxuICAgIC8vUmVuZGVyIG1hY3JvIGNoYXJ0XG4gICAgZDMuc2VsZWN0KCcjY29udGV4dCcpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGNvbnRleHQpO1xuXG4gICAgLy9SZW5kZXIgZmlsdGVyZWQgY2hhcnRcbiAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgIC8vQWRkaW5nIGJydXNoIHRvIHRoZSBjb250ZXh0IGNoYXJ0XG4gICAgdmFyIGJydXNoID0gZDMuc3ZnLmJydXNoKClcbiAgICAgIC54KGNvbnRleHQueFNjYWxlKCkpXG4gICAgICAub24oJ2JydXNoJywgYnJ1c2hlZCk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb250ZXh0IHN2ZycpXG4gICAgICAuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGJydXNoXCIpXG4gICAgICAuY2FsbChicnVzaClcbiAgICAgIC5zZWxlY3RBbGwoXCJyZWN0XCIpXG4gICAgICAuYXR0cihcInlcIiwgLTYpXG4gICAgICAuYXR0cihcImhlaWdodFwiLCBjb250ZXh0LmhlaWdodCgpICsgNylcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBjb250ZXh0Lm1hcmdpbigpLmxlZnQgKyAnLDApJyk7XG5cbiAgICAvL0NyZWF0ZSBhbmQgYXBwZW5kIGRhdGEgdGFibGVcbiAgICB2YXIgZGF0YVRhYmxlID0gdGFidWxhdGUoKTtcblxuICAgIGQzLnNlbGVjdCgnI2RhdGEtdGFibGUnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuY2FsbChkYXRhVGFibGUpO1xuXG5cbiAgICAvL1VwZGF0ZSBjaGFydHMgb24gYnJ1c2hcbiAgICBmdW5jdGlvbiBicnVzaGVkKCkge1xuICAgICAgdmFyIGZvY3VzRG9tYWluO1xuICAgICAgdmFyIGZpbHRlcmVkRGF0YTtcblxuICAgICAgaWYoIWJydXNoLmVtcHR5KCkpIHtcbiAgICAgICAgZm9jdXNEb21haW4gPSBicnVzaC5leHRlbnQoKTtcbiAgICAgICAgZmlsdGVyZWREYXRhID0gYjMuZmlsdGVyRGF0YUJ5RGF0ZVJhbmdlKGRhdGEsIGZvY3VzRG9tYWluKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvY3VzRG9tYWluID0gZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC50aW1lO30pO1xuICAgICAgICBmaWx0ZXJlZERhdGEgPSBkYXRhO1xuICAgICAgfSBcblxuICAgICAgLy9DbGlwIHRvIHByZXZlbnQgb3ZlcmxhcHBpbmcgYXhpc1xuICAgICAgZDMuc2VsZWN0QWxsKCcubGluZScpLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoI2NsaXApJyk7XG4gICAgICBkMy5zZWxlY3RBbGwoJ2NpcmNsZS5wb2ludCcpLmF0dHIoJ2NsaXAtcGF0aCcsICd1cmwoI2NsaXApJyk7XG5cblxuICAgICAgZm9jdXMuYnJ1c2hEb21haW4oZm9jdXNEb21haW4pO1xuXG4gICAgICBkMy5zZWxlY3QoJyNmb2N1cycpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChmb2N1cyk7XG5cbiAgICAgIGQzLnNlbGVjdCgndGFibGUnKS5yZW1vdmUoKTtcblxuICAgICAgZDMuc2VsZWN0KCcjZGF0YS10YWJsZScpXG4gICAgICAgIC5kYXR1bShmaWx0ZXJlZERhdGEpXG4gICAgICAgIC5jYWxsKGRhdGFUYWJsZSk7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2NvbnRleHQnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoY29udGV4dCk7XG5cbiAgICB9XG5cbiAgICAvL1VwZGF0ZSBjaGFydHMgYW5kIGJydXNoIG9uIG5ldyBkYXRhXG4gICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgdmFyIGJydXNoRXh0ZW50ID0gYnJ1c2guZXh0ZW50KCk7XG4gICAgICBicnVzaGVkKCk7XG4gICAgICBkMy5zZWxlY3QoJy5icnVzaCcpLmNhbGwoYnJ1c2guZXh0ZW50KGJydXNoRXh0ZW50KSk7XG4gICAgfVxuXG5cblxuICAgIC8vU2NhbGUgY2hhcnRzIG9uIHJlc2l6ZVxuICAgIGQzLnNlbGVjdCh3aW5kb3cpLm9uKCdyZXNpemUnLCByZXNpemUpO1xuXG4gICAgZnVuY3Rpb24gcmVzaXplKCkge1xuICAgICAgd2lkdGggPSBwYXJzZUludChkMy5zZWxlY3QoJy5jb250ZW50LWNvbnRhaW5lcicpLnN0eWxlKCd3aWR0aCcpKTtcbiAgICAgIFxuICAgICAgZm9jdXMud2lkdGgod2lkdGgpO1xuICAgICAgY29udGV4dC53aWR0aCh3aWR0aCk7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgICAgZDMuc2VsZWN0KCcjY29udGV4dCcpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChjb250ZXh0KTtcbiAgICB9XG5cbiAgfSk7XG5cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuXG5mdW5jdGlvbiBsaW5lQ2hhcnQoKSB7XG5cbiAgdmFyIHN2ZztcbiAgdmFyIGdFbnRlcjtcbiAgdmFyIGc7XG4gIHZhciBkYXRhID0gW107XG5cbiAgLy9EZWZhdWx0IGNvbmZpZ1xuICB2YXIgbWFyZ2luID0ge3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogNDB9O1xuICB2YXIgd2lkdGggPSA5NjA7XG4gIHZhciBoZWlnaHQgPSA1MDA7XG4gIHZhciB4VmFsdWUgPSBmdW5jdGlvbihkKSB7IHJldHVybiBkWzBdOyB9O1xuICB2YXIgeVZhbHVlID0gZnVuY3Rpb24oZCkgeyByZXR1cm4gZFsxXTsgfTtcbiAgdmFyIHggPSBkMy50aW1lLnNjYWxlKCkucmFuZ2UoWzAsIHdpZHRoXSk7XG4gIHZhciB5ID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoW2hlaWdodCwgMF0pO1xuICB2YXIgeFNjYWxlID0gZDMudGltZS5zY2FsZSgpO1xuICB2YXIgeVNjYWxlID0gZDMuc2NhbGUubGluZWFyKCk7XG4gIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeFNjYWxlKS5vcmllbnQoJ2JvdHRvbScpO1xuICB2YXIgeUF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHlTY2FsZSkub3JpZW50KCdsZWZ0Jyk7XG4gIHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKS54KFgpLnkoWSk7XG4gIHZhciB5UGFkZGluZyA9IDAuMDI1O1xuXG4gIC8vT3B0aW9uYWxcbiAgdmFyIGJydXNoRG9tYWluO1xuICB2YXIgYXBwZW5kQnJ1c2ggPSBmYWxzZTtcbiAgdmFyIGFwcGVuZFlBeGlzID0gZmFsc2U7XG4gIHZhciBhcHBlbmREYXRhUG9pbnRzID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gY2hhcnQoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblxuICAgICAgLy8gQ29udmVydCBkYXRhIHRvIHN0YW5kYXJkIHJlcHJlc2VudGF0aW9uIGdyZWVkaWx5O1xuICAgICAgLy8gdGhpcyBpcyBuZWVkZWQgZm9yIG5vbmRldGVybWluaXN0aWMgYWNjZXNzb3JzLlxuICAgICAgZGF0YSA9IHJlc3BvbnNlLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHJldHVybiBbeFZhbHVlLmNhbGwoZGF0YSwgZCwgaSksIHlWYWx1ZS5jYWxsKGRhdGEsIGQsIGkpXTtcbiAgICAgIH0pO1xuXG4gICAgICB1cGRhdGVYU2NhbGUoKTtcbiAgICAgIHVwZGF0ZVlTY2FsZSgpO1xuICAgICAgY3JlYXRlU2tlbGV0b24odGhpcyk7XG4gICAgICB1cGRhdGVEaW1lbnNpb25zKCk7XG4gICAgICB1cGRhdGVMaW5lKCk7XG4gICAgICB1cGRhdGVYQXhpcygpO1xuXG4gICAgICBpZihhcHBlbmRZQXhpcyA9PT0gdHJ1ZSkgeyB1cGRhdGVZQXhpcygpOyB9XG4gICAgICBpZihhcHBlbmREYXRhUG9pbnRzID09PSB0cnVlKSB7IHVwZGF0ZURhdGFQb2ludHMoKTsgfVxuXG4gICAgICBhcHBlbmRDbGlwKCk7XG5cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVhTY2FsZSgpIHtcbiAgICBpZihicnVzaERvbWFpbikge1xuICAgICAgeFNjYWxlXG4gICAgICAgIC5kb21haW4oYnJ1c2hEb21haW4pXG4gICAgICAgIC5yYW5nZShbMCwgd2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB4U2NhbGVcbiAgICAgICAgLmRvbWFpbihkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzBdOyB9KSlcbiAgICAgICAgLnJhbmdlKFswLCB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlWVNjYWxlKCkge1xuICAgIHZhciB5RXh0ZW50ID0gZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFsxXTsgfSk7XG4gICAgdmFyIHlNaW4gPSB5RXh0ZW50WzBdICogKDEgLSB5UGFkZGluZyk7XG4gICAgdmFyIHlNYXggPSB5RXh0ZW50WzFdICogKDEgKyB5UGFkZGluZyk7XG5cbiAgICB5U2NhbGVcbiAgICAgIC5kb21haW4oW3lNaW4sIHlNYXhdKVxuICAgICAgLnJhbmdlKFtoZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbSwgMF0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlU2tlbGV0b24oc2VsZWN0aW9uKSB7XG4gICAgLy9TZWxlY3QgdGhlIHN2ZyBlbGVtZW50IGlmIGl0IGV4aXN0c1xuICAgIHN2ZyA9IGQzLnNlbGVjdChzZWxlY3Rpb24pLnNlbGVjdEFsbCgnc3ZnJykuZGF0YShbZGF0YV0pO1xuXG4gICAgLy9PdGhlcndpc2UsIGNyZWF0ZSB0aGUgc2tlbGV0YWwgY2hhcnRcbiAgICBnRW50ZXIgPSBzdmcuZW50ZXIoKS5hcHBlbmQoJ3N2ZycpLmFwcGVuZCgnZycpO1xuICAgIGdFbnRlci5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdsaW5lJyk7XG4gICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3ggYXhpcycpO1xuXG4gICAgaWYoYXBwZW5kWUF4aXMgPT09IHRydWUpIHtcbiAgICAgIGdFbnRlci5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICd5IGF4aXMnKTsgICBcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVEaW1lbnNpb25zKCkge1xuICAgIC8vdXBkYXRlIHRoZSBvdXRlciBkaW1lbnNpb25zXG4gICAgc3ZnXG4gICAgICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpO1xuXG4gICAgLy91cGRhdGUgdGhlIGlubmVyIGRpbWVuc2lvbnNcbiAgICBnID0gc3ZnLnNlbGVjdCgnZycpXG4gICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFwcGVuZENsaXAoKSB7XG4gICAgLy9BZGQgY2xpcCBwYXRoIHNvIGRhdGEgZG9lc24ndCBjcm9zcyBheGlzXG4gICAgc3ZnLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwiY2xpcFBhdGhcIilcbiAgICAgICAgLmF0dHIoXCJpZFwiLCBcImNsaXBcIilcbiAgICAgIC5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVMaW5lKCkge1xuICAgIGcuc2VsZWN0KCcubGluZScpXG4gICAgICAuYXR0cignZCcsIGxpbmUpO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlWEF4aXMoKSB7XG4gICAgZy5zZWxlY3QoJy54LmF4aXMnKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIHlTY2FsZS5yYW5nZSgpWzBdICsgXCIpXCIpXG4gICAgICAuY2FsbCh4QXhpcyk7ICAgIFxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlWUF4aXMoKSB7XG4gICAgZy5zZWxlY3QoJy55LmF4aXMnKVxuICAgICAgLmNhbGwoeUF4aXMpOyAgICBcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZURhdGFQb2ludHMoKSB7XG4gICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3BvaW50cycpO1xuXG4gICAgZy5zZWxlY3QoJ2cucG9pbnRzJylcbiAgICAgIC5zZWxlY3RBbGwoJ2NpcmNsZS5wb2ludCcpXG4gICAgICAuZGF0YShkYXRhKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAuYXR0cignY2xhc3MnLCAncG9pbnQnKVxuICAgICAgLmF0dHIoJ3InLCAzLjUpO1xuXG4gICAgZy5zZWxlY3RBbGwoJ2NpcmNsZS5wb2ludCcpXG4gICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7IHJldHVybiB4U2NhbGUoZFswXSk7IH0pXG4gICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7IHJldHVybiB5U2NhbGUoZFsxXSk7IH0pO1xuICB9XG5cbiAgLy8gVGhlIHgtYWNjZXNzb3IgZm9yIHRoZSBwYXRoIGdlbmVyYXRvcjsgeFNjYWxlIOKImCB4VmFsdWUuXG4gIGZ1bmN0aW9uIFgoZCkge1xuICAgIHJldHVybiB4U2NhbGUoZFswXSk7XG4gIH1cblxuICAvLyBUaGUgeC1hY2Nlc3NvciBmb3IgdGhlIHBhdGggZ2VuZXJhdG9yOyB5U2NhbGUg4oiYIHlWYWx1ZS5cbiAgZnVuY3Rpb24gWShkKSB7XG4gICAgcmV0dXJuIHlTY2FsZShkWzFdKTtcbiAgfVxuXG4gIC8vR2V0dGVycyBhbmQgc2V0dGVyc1xuICBjaGFydC5tYXJnaW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtYXJnaW47XG4gICAgbWFyZ2luID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC53aWR0aCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB3aWR0aDtcbiAgICB3aWR0aCA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQuaGVpZ2h0ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGhlaWdodDtcbiAgICBoZWlnaHQgPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LnggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geFZhbHVlO1xuICAgIHhWYWx1ZSA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQueSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5VmFsdWU7XG4gICAgeVZhbHVlID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC5hcHBlbmRZQXhpcyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGFwcGVuZFlBeGlzO1xuICAgIGFwcGVuZFlBeGlzID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC5hcHBlbmREYXRhUG9pbnRzID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYXBwZW5kRGF0YVBvaW50cztcbiAgICBhcHBlbmREYXRhUG9pbnRzID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC54U2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4U2NhbGU7XG4gICAgeFNjYWxlID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC5icnVzaERvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJydXNoRG9tYWluO1xuICAgIGJydXNoRG9tYWluID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC55UGFkZGluZyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHlQYWRkaW5nO1xuICAgIHlQYWRkaW5nID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICByZXR1cm4gY2hhcnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGluZUNoYXJ0OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcblxuZnVuY3Rpb24gdGFidWxhdGUoKSB7XG5cbiAgZnVuY3Rpb24gY2FwaXRhbGl6ZShzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyg/Ol58XFxzKVxcUy9nLCBmdW5jdGlvbihhKSB7IHJldHVybiBhLnRvVXBwZXJDYXNlKCk7IH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdGFibGUoc2VsZWN0aW9uKSB7XG4gICAgc2VsZWN0aW9uLmVhY2goZnVuY3Rpb24oZGF0YSkge1xuXG4gICAgICAvL0NyZWF0ZSBhcnJheSBvZiBjb2x1bW5zIGZyb20gZGF0YSBrZXlzXG4gICAgICB2YXIgY29sdW1ucyA9IFtdO1xuICAgICAgdmFyIGRhdGFTYW1wbGUgPSBkYXRhWzBdO1xuXG4gICAgICBmb3IodmFyIGtleSBpbiBkYXRhU2FtcGxlKSB7XG4gICAgICAgIGNvbHVtbnMucHVzaChrZXkpO1xuICAgICAgfVxuXG4gICAgICAvL0NyZWF0ZSBhcnJheSBvZiBkYXRhXG4gICAgICB2YXIgY2VsbERhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICAgIHJldHVybiB7Y29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXX07XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIC8vU2VsZWN0IHRoZSBzdmcgZWxlbWVudCBpZiBpdCBleGlzdHNcbiAgICAgIHZhciB0YWJsZSA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3RhYmxlJykuZGF0YShbZGF0YV0pO1xuXG4gICAgICB2YXIgdEVudGVyID0gdGFibGUuZW50ZXIoKS5hcHBlbmQoJ3RhYmxlJyk7XG4gICAgICB2YXIgdGhlYWQgPSB0RW50ZXIuYXBwZW5kKCd0aGVhZCcpO1xuICAgICAgdmFyIHRib2R5ID0gdEVudGVyLmFwcGVuZCgndGJvZHknKTtcblxuXG4gICAgICAvL0FwcGVuZCBoZWFkZXIgcm93XG4gICAgICB0aGVhZC5hcHBlbmQoJ3RyJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2hlYWRlci1yb3cnKVxuICAgICAgICAuc2VsZWN0QWxsKCd0aCcpXG4gICAgICAgIC5kYXRhKGNvbHVtbnMpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ3RoJylcbiAgICAgICAgLnRleHQoZnVuY3Rpb24oY29sdW1uKSB7cmV0dXJuIGNhcGl0YWxpemUoY29sdW1uKTt9KTtcblxuXG4gICAgICAvL0NyZWF0ZSBSb3dzXG4gICAgICB2YXIgcm93cyA9IHRib2R5LnNlbGVjdEFsbCgndHInKVxuICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0cicpO1xuXG4gICAgICAvL0NyZWF0ZSBjZWxscyBpbiBlYWNoIHJvdyBmb3IgZWFjaCBjb2x1bW5cbiAgICAgIHZhciBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKCd0ZCcpXG4gICAgICAgIC5kYXRhKGZ1bmN0aW9uKHJvdykge1xuICAgICAgICAgIHJldHVybiBjb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4pIHtcbiAgICAgICAgICAgIHJldHVybiB7Y29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXX07XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ3RkJylcbiAgICAgICAgLmh0bWwoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC52YWx1ZTsgfSk7XG4gICAgfSk7XG5cbiAgfVxuXG4gIHJldHVybiB0YWJsZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0YWJ1bGF0ZTtcblxuXG4iLCJ2YXIgaW8gPSByZXF1aXJlKCdzb2NrZXQuaW8tY2xpZW50Jyk7XG52YXIgc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovL2xvY2FsaG9zdDo0MDAwJyk7XG5cbnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnY29ubmVjdGVkIHRvIHdlYnNvY2tldHMnKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNvY2tldDtcblxuXG4iXX0=
