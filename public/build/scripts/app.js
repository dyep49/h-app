(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./d3-charts.js')();
},{"./d3-charts.js":4}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
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
},{"d3":"d3"}],4:[function(require,module,exports){
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
    io.on('new-price', function(price) {
      var newPrice = b3.parsePrice(price);
      console.log(newPrice);
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
},{"./b3.js":3,"./linechart.js":5,"./table.js":6,"./websockets.js":7,"d3":"d3"}],5:[function(require,module,exports){
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
},{"d3":"d3"}],6:[function(require,module,exports){
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



},{"d3":"d3"}],7:[function(require,module,exports){
(function (process){
var io = require('socket.io-client');
var port = process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:4000';
var socket = io.connect(port);

socket.on('connect', function() {
  document.querySelector('.websockets-connect').style.display = 'inline';
  document.querySelector('.websockets-disconnect').style.display = 'none';
});

socket.on('disconnect', function() {
  document.querySelector('.websockets-connect').style.display = 'none';
  document.querySelector('.websockets-disconnect').style.display = 'inline';
})


module.exports = socket;



}).call(this,require('_process'))

},{"_process":2,"socket.io-client":"socket.io-client"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL2IzLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL2QzLWNoYXJ0cy5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9saW5lY2hhcnQuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvdGFibGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvd2Vic29ja2V0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKCcuL2QzLWNoYXJ0cy5qcycpKCk7IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuICAgIHZhciBjdXJyZW50UXVldWU7XG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtpXSgpO1xuICAgICAgICB9XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbn1cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgcXVldWUucHVzaChmdW4pO1xuICAgIGlmICghZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbnZhciBiMyA9IHtcbiAgcGFyc2VQcmljZTogZnVuY3Rpb24ocHJpY2UpIHtcbiAgICB2YXIgcGFyc2VkUHJpY2UgPSB7fTtcbiAgICBwYXJzZWRQcmljZS50aW1lID0gbmV3IERhdGUocHJpY2UudGltZSk7XG4gICAgcGFyc2VkUHJpY2UucHJpY2UgPSArcHJpY2UubGFzdFByaWNlO1xuXG4gICAgcmV0dXJuIHBhcnNlZFByaWNlO1xuICB9LFxuXG4gIGZpbHRlckRhdGFCeURhdGVSYW5nZTogZnVuY3Rpb24oZGF0YSwgZXh0ZW50KSB7XG4gICAgdmFyIHRpbWVNaW4gPSBleHRlbnRbMF07XG4gICAgdmFyIHRpbWVNYXggPSBleHRlbnRbMV07XG5cbiAgICByZXR1cm4gZGF0YS5maWx0ZXIoZnVuY3Rpb24oZGF0dW0pIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZShkYXR1bS50aW1lKSA+PSB0aW1lTWluICYmIG5ldyBEYXRlKGRhdHVtLnRpbWUpIDw9IHRpbWVNYXg7XG4gICAgfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYjM7IiwiLy9BZGFwdGVkIGZyb20gaHR0cDovL2JsLm9ja3Mub3JnL21ib3N0b2NrLzE2NjczNjdcbid1c2Ugc3RyaWN0JztcblxudmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcbnZhciBiMyA9IHJlcXVpcmUoJy4vYjMuanMnKTtcbnZhciBsaW5lQ2hhcnQgPSByZXF1aXJlKCcuL2xpbmVjaGFydC5qcycpO1xudmFyIHRhYnVsYXRlID0gcmVxdWlyZSgnLi90YWJsZS5qcycpO1xudmFyIGlvID0gcmVxdWlyZSgnLi93ZWJzb2NrZXRzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHdpZHRoID0gcGFyc2VJbnQoZDMuc2VsZWN0KCcuY29udGVudC1jb250YWluZXInKS5zdHlsZSgnd2lkdGgnKSk7XG5cbiAgZDMuanNvbignL3ByaWNlcycsIGZ1bmN0aW9uKGVyciwgZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhLnByaWNlcy5yZXZlcnNlKCkubWFwKGIzLnBhcnNlUHJpY2UpO1xuICAgIC8vVXBkYXRlIG9uIG5ldyBwcmljZSBzZW50IHZpYSB3ZWJzb2NrZXRzXG4gICAgaW8ub24oJ25ldy1wcmljZScsIGZ1bmN0aW9uKHByaWNlKSB7XG4gICAgICB2YXIgbmV3UHJpY2UgPSBiMy5wYXJzZVByaWNlKHByaWNlKTtcbiAgICAgIGNvbnNvbGUubG9nKG5ld1ByaWNlKTtcbiAgICAgIGlmKEpTT04uc3RyaW5naWZ5KG5ld1ByaWNlKSAhPT0gSlNPTi5zdHJpbmdpZnkoZGF0YVtkYXRhLmxlbmd0aCAtIDFdKSkge1xuICAgICAgICBkYXRhLnB1c2gobmV3UHJpY2UpO1xuICAgICAgICB1cGRhdGUoKTsgICAgICAgIFxuICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICAvL0NyZWF0ZSBtYWNybyBjaGFydFxuICAgIHZhciBjb250ZXh0ID0gbGluZUNoYXJ0KCkgICAgXG4gICAgICAueChmdW5jdGlvbihkKSB7IHJldHVybiBkLnRpbWU7IH0pXG4gICAgICAueShmdW5jdGlvbihkKSB7IHJldHVybiBkLnByaWNlOyB9KVxuICAgICAgLnlQYWRkaW5nKDAuMDEpXG4gICAgICAuaGVpZ2h0KDEwMClcbiAgICAgIC53aWR0aCh3aWR0aCk7XG5cbiAgICAvL0NyZWF0ZSBmaWx0ZXJlZCBjaGFydFxuICAgIHZhciBmb2N1cyA9IGxpbmVDaGFydCgpXG4gICAgICAueChmdW5jdGlvbihkKSB7IHJldHVybiBkLnRpbWU7IH0pXG4gICAgICAueShmdW5jdGlvbihkKSB7IHJldHVybiBkLnByaWNlOyB9KVxuICAgICAgLndpZHRoKHdpZHRoKVxuICAgICAgLm1hcmdpbih7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDMwLCBsZWZ0OiA0MH0pXG4gICAgICAuYXBwZW5kWUF4aXModHJ1ZSlcbiAgICAgIC5hcHBlbmREYXRhUG9pbnRzKHRydWUpO1xuXG4gICAgLy9SZW5kZXIgbWFjcm8gY2hhcnRcbiAgICBkMy5zZWxlY3QoJyNjb250ZXh0JylcbiAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgLmNhbGwoY29udGV4dCk7XG5cbiAgICAvL1JlbmRlciBmaWx0ZXJlZCBjaGFydFxuICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgLmNhbGwoZm9jdXMpO1xuXG4gICAgLy9BZGRpbmcgYnJ1c2ggdG8gdGhlIGNvbnRleHQgY2hhcnRcbiAgICB2YXIgYnJ1c2ggPSBkMy5zdmcuYnJ1c2goKVxuICAgICAgLngoY29udGV4dC54U2NhbGUoKSlcbiAgICAgIC5vbignYnJ1c2gnLCBicnVzaGVkKTtcblxuICAgIGQzLnNlbGVjdCgnI2NvbnRleHQgc3ZnJylcbiAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYnJ1c2hcIilcbiAgICAgIC5jYWxsKGJydXNoKVxuICAgICAgLnNlbGVjdEFsbChcInJlY3RcIilcbiAgICAgIC5hdHRyKFwieVwiLCAtNilcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGNvbnRleHQuaGVpZ2h0KCkgKyA3KVxuICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGNvbnRleHQubWFyZ2luKCkubGVmdCArICcsMCknKTtcblxuICAgIC8vQ3JlYXRlIGFuZCBhcHBlbmQgZGF0YSB0YWJsZVxuICAgIHZhciBkYXRhVGFibGUgPSB0YWJ1bGF0ZSgpO1xuXG4gICAgZDMuc2VsZWN0KCcjZGF0YS10YWJsZScpXG4gICAgICAuZGF0dW0oZGF0YSlcbiAgICAgIC5jYWxsKGRhdGFUYWJsZSk7XG5cblxuICAgIC8vVXBkYXRlIGNoYXJ0cyBvbiBicnVzaFxuICAgIGZ1bmN0aW9uIGJydXNoZWQoKSB7XG4gICAgICB2YXIgZm9jdXNEb21haW47XG4gICAgICB2YXIgZmlsdGVyZWREYXRhO1xuXG4gICAgICBpZighYnJ1c2guZW1wdHkoKSkge1xuICAgICAgICBmb2N1c0RvbWFpbiA9IGJydXNoLmV4dGVudCgpO1xuICAgICAgICBmaWx0ZXJlZERhdGEgPSBiMy5maWx0ZXJEYXRhQnlEYXRlUmFuZ2UoZGF0YSwgZm9jdXNEb21haW4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9jdXNEb21haW4gPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkLnRpbWU7fSk7XG4gICAgICAgIGZpbHRlcmVkRGF0YSA9IGRhdGE7XG4gICAgICB9IFxuXG4gICAgICAvL0NsaXAgdG8gcHJldmVudCBvdmVybGFwcGluZyBheGlzXG4gICAgICBkMy5zZWxlY3RBbGwoJy5saW5lJykuYXR0cignY2xpcC1wYXRoJywgJ3VybCgjY2xpcCknKTtcbiAgICAgIGQzLnNlbGVjdEFsbCgnY2lyY2xlLnBvaW50JykuYXR0cignY2xpcC1wYXRoJywgJ3VybCgjY2xpcCknKTtcblxuXG4gICAgICBmb2N1cy5icnVzaERvbWFpbihmb2N1c0RvbWFpbik7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgICAgZDMuc2VsZWN0KCd0YWJsZScpLnJlbW92ZSgpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNkYXRhLXRhYmxlJylcbiAgICAgICAgLmRhdHVtKGZpbHRlcmVkRGF0YSlcbiAgICAgICAgLmNhbGwoZGF0YVRhYmxlKTtcblxuICAgICAgZDMuc2VsZWN0KCcjY29udGV4dCcpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChjb250ZXh0KTtcblxuICAgIH1cblxuICAgIC8vVXBkYXRlIGNoYXJ0cyBhbmQgYnJ1c2ggb24gbmV3IGRhdGFcbiAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICB2YXIgYnJ1c2hFeHRlbnQgPSBicnVzaC5leHRlbnQoKTtcbiAgICAgIGJydXNoZWQoKTtcbiAgICAgIGQzLnNlbGVjdCgnLmJydXNoJykuY2FsbChicnVzaC5leHRlbnQoYnJ1c2hFeHRlbnQpKTtcbiAgICB9XG5cblxuXG4gICAgLy9TY2FsZSBjaGFydHMgb24gcmVzaXplXG4gICAgZDMuc2VsZWN0KHdpbmRvdykub24oJ3Jlc2l6ZScsIHJlc2l6ZSk7XG5cbiAgICBmdW5jdGlvbiByZXNpemUoKSB7XG4gICAgICB3aWR0aCA9IHBhcnNlSW50KGQzLnNlbGVjdCgnLmNvbnRlbnQtY29udGFpbmVyJykuc3R5bGUoJ3dpZHRoJykpO1xuICAgICAgXG4gICAgICBmb2N1cy53aWR0aCh3aWR0aCk7XG4gICAgICBjb250ZXh0LndpZHRoKHdpZHRoKTtcblxuICAgICAgZDMuc2VsZWN0KCcjZm9jdXMnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoZm9jdXMpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZXh0JylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGNvbnRleHQpO1xuICAgIH1cblxuICB9KTtcblxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbmZ1bmN0aW9uIGxpbmVDaGFydCgpIHtcblxuICB2YXIgc3ZnO1xuICB2YXIgZ0VudGVyO1xuICB2YXIgZztcbiAgdmFyIGRhdGEgPSBbXTtcblxuICAvL0RlZmF1bHQgY29uZmlnXG4gIHZhciBtYXJnaW4gPSB7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDIwLCBsZWZ0OiA0MH07XG4gIHZhciB3aWR0aCA9IDk2MDtcbiAgdmFyIGhlaWdodCA9IDUwMDtcbiAgdmFyIHhWYWx1ZSA9IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbMF07IH07XG4gIHZhciB5VmFsdWUgPSBmdW5jdGlvbihkKSB7IHJldHVybiBkWzFdOyB9O1xuICB2YXIgeCA9IGQzLnRpbWUuc2NhbGUoKS5yYW5nZShbMCwgd2lkdGhdKTtcbiAgdmFyIHkgPSBkMy5zY2FsZS5saW5lYXIoKS5yYW5nZShbaGVpZ2h0LCAwXSk7XG4gIHZhciB4U2NhbGUgPSBkMy50aW1lLnNjYWxlKCk7XG4gIHZhciB5U2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKTtcbiAgdmFyIHhBeGlzID0gZDMuc3ZnLmF4aXMoKS5zY2FsZSh4U2NhbGUpLm9yaWVudCgnYm90dG9tJyk7XG4gIHZhciB5QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeVNjYWxlKS5vcmllbnQoJ2xlZnQnKTtcbiAgdmFyIGxpbmUgPSBkMy5zdmcubGluZSgpLngoWCkueShZKTtcbiAgdmFyIHlQYWRkaW5nID0gMC4wMjU7XG5cbiAgLy9PcHRpb25hbFxuICB2YXIgYnJ1c2hEb21haW47XG4gIHZhciBhcHBlbmRCcnVzaCA9IGZhbHNlO1xuICB2YXIgYXBwZW5kWUF4aXMgPSBmYWxzZTtcbiAgdmFyIGFwcGVuZERhdGFQb2ludHMgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBjaGFydChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXG4gICAgICAvLyBDb252ZXJ0IGRhdGEgdG8gc3RhbmRhcmQgcmVwcmVzZW50YXRpb24gZ3JlZWRpbHk7XG4gICAgICAvLyB0aGlzIGlzIG5lZWRlZCBmb3Igbm9uZGV0ZXJtaW5pc3RpYyBhY2Nlc3NvcnMuXG4gICAgICBkYXRhID0gcmVzcG9uc2UubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIFt4VmFsdWUuY2FsbChkYXRhLCBkLCBpKSwgeVZhbHVlLmNhbGwoZGF0YSwgZCwgaSldO1xuICAgICAgfSk7XG5cbiAgICAgIHVwZGF0ZVhTY2FsZSgpO1xuICAgICAgdXBkYXRlWVNjYWxlKCk7XG4gICAgICBjcmVhdGVTa2VsZXRvbih0aGlzKTtcbiAgICAgIHVwZGF0ZURpbWVuc2lvbnMoKTtcbiAgICAgIHVwZGF0ZUxpbmUoKTtcbiAgICAgIHVwZGF0ZVhBeGlzKCk7XG5cbiAgICAgIGlmKGFwcGVuZFlBeGlzID09PSB0cnVlKSB7IHVwZGF0ZVlBeGlzKCk7IH1cbiAgICAgIGlmKGFwcGVuZERhdGFQb2ludHMgPT09IHRydWUpIHsgdXBkYXRlRGF0YVBvaW50cygpOyB9XG5cbiAgICAgIGFwcGVuZENsaXAoKTtcblxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlWFNjYWxlKCkge1xuICAgIGlmKGJydXNoRG9tYWluKSB7XG4gICAgICB4U2NhbGVcbiAgICAgICAgLmRvbWFpbihicnVzaERvbWFpbilcbiAgICAgICAgLnJhbmdlKFswLCB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHhTY2FsZVxuICAgICAgICAuZG9tYWluKGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7cmV0dXJuIGRbMF07IH0pKVxuICAgICAgICAucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVZU2NhbGUoKSB7XG4gICAgdmFyIHlFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzFdOyB9KTtcbiAgICB2YXIgeU1pbiA9IHlFeHRlbnRbMF0gKiAoMSAtIHlQYWRkaW5nKTtcbiAgICB2YXIgeU1heCA9IHlFeHRlbnRbMV0gKiAoMSArIHlQYWRkaW5nKTtcblxuICAgIHlTY2FsZVxuICAgICAgLmRvbWFpbihbeU1pbiwgeU1heF0pXG4gICAgICAucmFuZ2UoW2hlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tLCAwXSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVTa2VsZXRvbihzZWxlY3Rpb24pIHtcbiAgICAvL1NlbGVjdCB0aGUgc3ZnIGVsZW1lbnQgaWYgaXQgZXhpc3RzXG4gICAgc3ZnID0gZDMuc2VsZWN0KHNlbGVjdGlvbikuc2VsZWN0QWxsKCdzdmcnKS5kYXRhKFtkYXRhXSk7XG5cbiAgICAvL090aGVyd2lzZSwgY3JlYXRlIHRoZSBza2VsZXRhbCBjaGFydFxuICAgIGdFbnRlciA9IHN2Zy5lbnRlcigpLmFwcGVuZCgnc3ZnJykuYXBwZW5kKCdnJyk7XG4gICAgZ0VudGVyLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2xpbmUnKTtcbiAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneCBheGlzJyk7XG5cbiAgICBpZihhcHBlbmRZQXhpcyA9PT0gdHJ1ZSkge1xuICAgICAgZ0VudGVyLmFwcGVuZCgnZycpLmF0dHIoJ2NsYXNzJywgJ3kgYXhpcycpOyAgIFxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZURpbWVuc2lvbnMoKSB7XG4gICAgLy91cGRhdGUgdGhlIG91dGVyIGRpbWVuc2lvbnNcbiAgICBzdmdcbiAgICAgIC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxuICAgICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgICAvL3VwZGF0ZSB0aGUgaW5uZXIgZGltZW5zaW9uc1xuICAgIGcgPSBzdmcuc2VsZWN0KCdnJylcbiAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXBwZW5kQ2xpcCgpIHtcbiAgICAvL0FkZCBjbGlwIHBhdGggc28gZGF0YSBkb2Vzbid0IGNyb3NzIGF4aXNcbiAgICBzdmcuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJjbGlwUGF0aFwiKVxuICAgICAgICAuYXR0cihcImlkXCIsIFwiY2xpcFwiKVxuICAgICAgLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUxpbmUoKSB7XG4gICAgZy5zZWxlY3QoJy5saW5lJylcbiAgICAgIC5hdHRyKCdkJywgbGluZSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVYQXhpcygpIHtcbiAgICBnLnNlbGVjdCgnLnguYXhpcycpXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgeVNjYWxlLnJhbmdlKClbMF0gKyBcIilcIilcbiAgICAgIC5jYWxsKHhBeGlzKTsgICAgXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVZQXhpcygpIHtcbiAgICBnLnNlbGVjdCgnLnkuYXhpcycpXG4gICAgICAuY2FsbCh5QXhpcyk7ICAgIFxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlRGF0YVBvaW50cygpIHtcbiAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAncG9pbnRzJyk7XG5cbiAgICBnLnNlbGVjdCgnZy5wb2ludHMnKVxuICAgICAgLnNlbGVjdEFsbCgnY2lyY2xlLnBvaW50JylcbiAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAuZW50ZXIoKVxuICAgICAgLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdwb2ludCcpXG4gICAgICAuYXR0cigncicsIDMuNSk7XG5cbiAgICBnLnNlbGVjdEFsbCgnY2lyY2xlLnBvaW50JylcbiAgICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHhTY2FsZShkWzBdKTsgfSlcbiAgICAgIC5hdHRyKCdjeScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHlTY2FsZShkWzFdKTsgfSk7XG4gIH1cblxuICAvLyBUaGUgeC1hY2Nlc3NvciBmb3IgdGhlIHBhdGggZ2VuZXJhdG9yOyB4U2NhbGUg4oiYIHhWYWx1ZS5cbiAgZnVuY3Rpb24gWChkKSB7XG4gICAgcmV0dXJuIHhTY2FsZShkWzBdKTtcbiAgfVxuXG4gIC8vIFRoZSB4LWFjY2Vzc29yIGZvciB0aGUgcGF0aCBnZW5lcmF0b3I7IHlTY2FsZSDiiJggeVZhbHVlLlxuICBmdW5jdGlvbiBZKGQpIHtcbiAgICByZXR1cm4geVNjYWxlKGRbMV0pO1xuICB9XG5cbiAgLy9HZXR0ZXJzIGFuZCBzZXR0ZXJzXG4gIGNoYXJ0Lm1hcmdpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1hcmdpbjtcbiAgICBtYXJnaW4gPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LndpZHRoID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHdpZHRoO1xuICAgIHdpZHRoID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC5oZWlnaHQgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaGVpZ2h0O1xuICAgIGhlaWdodCA9IF87XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgY2hhcnQueCA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4VmFsdWU7XG4gICAgeFZhbHVlID0gXztcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBjaGFydC55ID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHlWYWx1ZTtcbiAgICB5VmFsdWUgPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LmFwcGVuZFlBeGlzID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYXBwZW5kWUF4aXM7XG4gICAgYXBwZW5kWUF4aXMgPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LmFwcGVuZERhdGFQb2ludHMgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBhcHBlbmREYXRhUG9pbnRzO1xuICAgIGFwcGVuZERhdGFQb2ludHMgPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LnhTY2FsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHhTY2FsZTtcbiAgICB4U2NhbGUgPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LmJydXNoRG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYnJ1c2hEb21haW47XG4gICAgYnJ1c2hEb21haW4gPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGNoYXJ0LnlQYWRkaW5nID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geVBhZGRpbmc7XG4gICAgeVBhZGRpbmcgPSBfO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBjaGFydDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaW5lQ2hhcnQ7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuXG5mdW5jdGlvbiB0YWJ1bGF0ZSgpIHtcblxuICBmdW5jdGlvbiBjYXBpdGFsaXplKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvKD86XnxcXHMpXFxTL2csIGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEudG9VcHBlckNhc2UoKTsgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB0YWJsZShzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgIC8vQ3JlYXRlIGFycmF5IG9mIGNvbHVtbnMgZnJvbSBkYXRhIGtleXNcbiAgICAgIHZhciBjb2x1bW5zID0gW107XG4gICAgICB2YXIgZGF0YVNhbXBsZSA9IGRhdGFbMF07XG5cbiAgICAgIGZvcih2YXIga2V5IGluIGRhdGFTYW1wbGUpIHtcbiAgICAgICAgY29sdW1ucy5wdXNoKGtleSk7XG4gICAgICB9XG5cbiAgICAgIC8vQ3JlYXRlIGFycmF5IG9mIGRhdGFcbiAgICAgIHZhciBjZWxsRGF0YSA9IGRhdGEubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7XG4gICAgICAgICAgcmV0dXJuIHtjb2x1bW46IGNvbHVtbiwgdmFsdWU6IHJvd1tjb2x1bW5dfTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgLy9TZWxlY3QgdGhlIHN2ZyBlbGVtZW50IGlmIGl0IGV4aXN0c1xuICAgICAgdmFyIHRhYmxlID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgndGFibGUnKS5kYXRhKFtkYXRhXSk7XG5cbiAgICAgIHZhciB0RW50ZXIgPSB0YWJsZS5lbnRlcigpLmFwcGVuZCgndGFibGUnKTtcbiAgICAgIHZhciB0aGVhZCA9IHRFbnRlci5hcHBlbmQoJ3RoZWFkJyk7XG4gICAgICB2YXIgdGJvZHkgPSB0RW50ZXIuYXBwZW5kKCd0Ym9keScpO1xuXG5cbiAgICAgIC8vQXBwZW5kIGhlYWRlciByb3dcbiAgICAgIHRoZWFkLmFwcGVuZCgndHInKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnaGVhZGVyLXJvdycpXG4gICAgICAgIC5zZWxlY3RBbGwoJ3RoJylcbiAgICAgICAgLmRhdGEoY29sdW1ucylcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgndGgnKVxuICAgICAgICAudGV4dChmdW5jdGlvbihjb2x1bW4pIHtyZXR1cm4gY2FwaXRhbGl6ZShjb2x1bW4pO30pO1xuXG5cbiAgICAgIC8vQ3JlYXRlIFJvd3NcbiAgICAgIHZhciByb3dzID0gdGJvZHkuc2VsZWN0QWxsKCd0cicpXG4gICAgICAgIC5kYXRhKGRhdGEpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ3RyJyk7XG5cbiAgICAgIC8vQ3JlYXRlIGNlbGxzIGluIGVhY2ggcm93IGZvciBlYWNoIGNvbHVtblxuICAgICAgdmFyIGNlbGxzID0gcm93cy5zZWxlY3RBbGwoJ3RkJylcbiAgICAgICAgLmRhdGEoZnVuY3Rpb24ocm93KSB7XG4gICAgICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICAgICAgcmV0dXJuIHtjb2x1bW46IGNvbHVtbiwgdmFsdWU6IHJvd1tjb2x1bW5dfTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmVudGVyKClcbiAgICAgICAgLmFwcGVuZCgndGQnKVxuICAgICAgICAuaHRtbChmdW5jdGlvbihkKSB7IHJldHVybiBkLnZhbHVlOyB9KTtcbiAgICB9KTtcblxuICB9XG5cbiAgcmV0dXJuIHRhYmxlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRhYnVsYXRlO1xuXG5cbiIsInZhciBpbyA9IHJlcXVpcmUoJ3NvY2tldC5pby1jbGllbnQnKTtcbnZhciBwb3J0ID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyA/ICcvJyA6ICdodHRwOi8vbG9jYWxob3N0OjQwMDAnO1xudmFyIHNvY2tldCA9IGlvLmNvbm5lY3QocG9ydCk7XG5cbnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKCkge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcud2Vic29ja2V0cy1jb25uZWN0Jykuc3R5bGUuZGlzcGxheSA9ICdpbmxpbmUnO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcud2Vic29ja2V0cy1kaXNjb25uZWN0Jykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbn0pO1xuXG5zb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLndlYnNvY2tldHMtY29ubmVjdCcpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53ZWJzb2NrZXRzLWRpc2Nvbm5lY3QnKS5zdHlsZS5kaXNwbGF5ID0gJ2lubGluZSc7XG59KVxuXG5cbm1vZHVsZS5leHBvcnRzID0gc29ja2V0O1xuXG5cbiJdfQ==
