(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
// require('./charts.js')();
require('./d3-charts.js')();
},{"./d3-charts.js":2}],2:[function(require,module,exports){
//Adapted from http://bl.ocks.org/mbostock/1667367

var d3 = require('d3');
var lineChart = require('./linechart.js');
var tabulate = require('./table.js');
var io = require('./websockets.js');



module.exports = function() {

  var width = parseInt(d3.select('.content-container').style('width'))

  function parsePrice(price) {
    var parsedPrice = {};
    parsedPrice.time = new Date(price.time);
    parsedPrice.price = +price.lastPrice;

    return parsedPrice
  }

  d3.json('/prices', function(err, data) {
    data = data.prices.map(parsePrice);

    io.on('price', function(price) {
      newPrice = parsePrice(price);

      if(JSON.stringify(newPrice) !== JSON.stringify(data[data.length - 1])) {
        data.push(newPrice);
        update();        
      }

    })

    var context = lineChart()    
      .x(function(d) {return d.time})
      .y(function(d) {return d.price})
      .yPadding(0.01)
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


    function update() {
      var brushExtent = brush.extent();
      brushed();
      d3.select('.brush').call(brush.extent(brushExtent));

    }

    function filterDataByDateRange(data, extent) {
        var timeMin = extent[0];
        var timeMax = extent[1];

        return data.filter(function(datum) {
          var timeMin = brush.extent()[0];
          var timeMax = brush.extent()[1];
          return datum.time >= timeMin && datum.time <= timeMax
        }) 
    }


    function brushed() {
      if(!brush.empty()) {
        var focusDomain = brush.extent();
        var filteredData = filterDataByDateRange(data, focusDomain);
      } else {
        var focusDomain = d3.extent(data, function(d) {return d.time;})
        var filteredData = data;
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
},{"./linechart.js":3,"./table.js":4,"./websockets.js":5,"d3":"d3"}],3:[function(require,module,exports){
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

  var yPadding = 0.025;

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

      var yExtent = d3.extent(data, function(d) {return d[1]})
      var yMin = yExtent[0] * (1 - yPadding);
      var yMax = yExtent[1] * (1 + yPadding)

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
      svg.enter().append("defs").append("clipPath")
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

  chart.yPadding = function(_) {
    if(!arguments.length) return yPadding;
    yPadding = _;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvbGluZWNoYXJ0LmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3RhYmxlLmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3dlYnNvY2tldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHJlcXVpcmUoJy4vY2hhcnQuanMnKSgpO1xuLy8gcmVxdWlyZSgnLi9jaGFydHMuanMnKSgpO1xucmVxdWlyZSgnLi9kMy1jaGFydHMuanMnKSgpOyIsIi8vQWRhcHRlZCBmcm9tIGh0dHA6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay8xNjY3MzY3XG5cbnZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG52YXIgbGluZUNoYXJ0ID0gcmVxdWlyZSgnLi9saW5lY2hhcnQuanMnKTtcbnZhciB0YWJ1bGF0ZSA9IHJlcXVpcmUoJy4vdGFibGUuanMnKTtcbnZhciBpbyA9IHJlcXVpcmUoJy4vd2Vic29ja2V0cy5qcycpO1xuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblxuICB2YXIgd2lkdGggPSBwYXJzZUludChkMy5zZWxlY3QoJy5jb250ZW50LWNvbnRhaW5lcicpLnN0eWxlKCd3aWR0aCcpKVxuXG4gIGZ1bmN0aW9uIHBhcnNlUHJpY2UocHJpY2UpIHtcbiAgICB2YXIgcGFyc2VkUHJpY2UgPSB7fTtcbiAgICBwYXJzZWRQcmljZS50aW1lID0gbmV3IERhdGUocHJpY2UudGltZSk7XG4gICAgcGFyc2VkUHJpY2UucHJpY2UgPSArcHJpY2UubGFzdFByaWNlO1xuXG4gICAgcmV0dXJuIHBhcnNlZFByaWNlXG4gIH1cblxuICBkMy5qc29uKCcvcHJpY2VzJywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEucHJpY2VzLm1hcChwYXJzZVByaWNlKTtcblxuICAgIGlvLm9uKCdwcmljZScsIGZ1bmN0aW9uKHByaWNlKSB7XG4gICAgICBuZXdQcmljZSA9IHBhcnNlUHJpY2UocHJpY2UpO1xuXG4gICAgICBpZihKU09OLnN0cmluZ2lmeShuZXdQcmljZSkgIT09IEpTT04uc3RyaW5naWZ5KGRhdGFbZGF0YS5sZW5ndGggLSAxXSkpIHtcbiAgICAgICAgZGF0YS5wdXNoKG5ld1ByaWNlKTtcbiAgICAgICAgdXBkYXRlKCk7ICAgICAgICBcbiAgICAgIH1cblxuICAgIH0pXG5cbiAgICB2YXIgY29udGV4dCA9IGxpbmVDaGFydCgpICAgIFxuICAgICAgLngoZnVuY3Rpb24oZCkge3JldHVybiBkLnRpbWV9KVxuICAgICAgLnkoZnVuY3Rpb24oZCkge3JldHVybiBkLnByaWNlfSlcbiAgICAgIC55UGFkZGluZygwLjAxKVxuICAgICAgLmhlaWdodCgxMDApXG4gICAgICAud2lkdGgod2lkdGgpO1xuXG5cbiAgICB2YXIgZm9jdXMgPSBsaW5lQ2hhcnQoKVxuICAgICAgLngoZnVuY3Rpb24oZCkge3JldHVybiBkLnRpbWV9KVxuICAgICAgLnkoZnVuY3Rpb24oZCkge3JldHVybiBkLnByaWNlfSlcbiAgICAgIC53aWR0aCh3aWR0aClcbiAgICAgIC5tYXJnaW4oe3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAzMCwgbGVmdDogNDB9KVxuICAgICAgLmFwcGVuZFlBeGlzKHRydWUpXG4gICAgICAuYXBwZW5kRGF0YVBvaW50cyh0cnVlKTtcblxuXG4gICAgZDMuc2VsZWN0KCcjZm9jdXMnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuY2FsbChmb2N1cyk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb250ZXh0JylcbiAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgLmNhbGwoY29udGV4dCk7XG5cbiAgICAvL0FkZGluZyBicnVzaCB0byB0aGUgY29udGV4dCBjaGFydFxuICAgIHZhciBicnVzaCA9IGQzLnN2Zy5icnVzaCgpXG4gICAgICAueChjb250ZXh0LnhTY2FsZSgpKVxuICAgICAgLm9uKCdicnVzaCcsIGJydXNoZWQpO1xuXG4gICAgZDMuc2VsZWN0KCcjY29udGV4dCBzdmcnKVxuICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBicnVzaFwiKVxuICAgICAgLmNhbGwoYnJ1c2gpXG4gICAgICAuc2VsZWN0QWxsKFwicmVjdFwiKVxuICAgICAgLmF0dHIoXCJ5XCIsIC02KVxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgY29udGV4dC5oZWlnaHQoKSArIDcpXG4gICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgY29udGV4dC5tYXJnaW4oKS5sZWZ0ICsgJywwKScpO1xuXG4gICAgdmFyIGRhdGFUYWJsZSA9IHRhYnVsYXRlKClcblxuICAgIGQzLnNlbGVjdCgnI2RhdGEtdGFibGUnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuY2FsbChkYXRhVGFibGUpO1xuXG5cbiAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICB2YXIgYnJ1c2hFeHRlbnQgPSBicnVzaC5leHRlbnQoKTtcbiAgICAgIGJydXNoZWQoKTtcbiAgICAgIGQzLnNlbGVjdCgnLmJydXNoJykuY2FsbChicnVzaC5leHRlbnQoYnJ1c2hFeHRlbnQpKTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbHRlckRhdGFCeURhdGVSYW5nZShkYXRhLCBleHRlbnQpIHtcbiAgICAgICAgdmFyIHRpbWVNaW4gPSBleHRlbnRbMF07XG4gICAgICAgIHZhciB0aW1lTWF4ID0gZXh0ZW50WzFdO1xuXG4gICAgICAgIHJldHVybiBkYXRhLmZpbHRlcihmdW5jdGlvbihkYXR1bSkge1xuICAgICAgICAgIHZhciB0aW1lTWluID0gYnJ1c2guZXh0ZW50KClbMF07XG4gICAgICAgICAgdmFyIHRpbWVNYXggPSBicnVzaC5leHRlbnQoKVsxXTtcbiAgICAgICAgICByZXR1cm4gZGF0dW0udGltZSA+PSB0aW1lTWluICYmIGRhdHVtLnRpbWUgPD0gdGltZU1heFxuICAgICAgICB9KSBcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGJydXNoZWQoKSB7XG4gICAgICBpZighYnJ1c2guZW1wdHkoKSkge1xuICAgICAgICB2YXIgZm9jdXNEb21haW4gPSBicnVzaC5leHRlbnQoKTtcbiAgICAgICAgdmFyIGZpbHRlcmVkRGF0YSA9IGZpbHRlckRhdGFCeURhdGVSYW5nZShkYXRhLCBmb2N1c0RvbWFpbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZm9jdXNEb21haW4gPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkLnRpbWU7fSlcbiAgICAgICAgdmFyIGZpbHRlcmVkRGF0YSA9IGRhdGE7XG4gICAgICB9IFxuXG4gICAgICBmb2N1cy5icnVzaERvbWFpbihmb2N1c0RvbWFpbik7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgICAgZDMuc2VsZWN0KCd0YWJsZScpLnJlbW92ZSgpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNkYXRhLXRhYmxlJylcbiAgICAgICAgLmRhdHVtKGZpbHRlcmVkRGF0YSlcbiAgICAgICAgLmNhbGwoZGF0YVRhYmxlKTtcblxuICAgICAgZDMuc2VsZWN0KCcjY29udGV4dCcpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChjb250ZXh0KTtcblxuICAgIH1cblxuXG5cbiAgICAvL1NjYWxlIGNoYXJ0cyBvbiByZXNpemVcbiAgICBkMy5zZWxlY3Qod2luZG93KS5vbigncmVzaXplJywgcmVzaXplKVxuXG4gICAgZnVuY3Rpb24gcmVzaXplKCkge1xuICAgICAgd2lkdGggPSBwYXJzZUludChkMy5zZWxlY3QoJy5jb250ZW50LWNvbnRhaW5lcicpLnN0eWxlKCd3aWR0aCcpKVxuICAgICAgXG4gICAgICBmb2N1cy53aWR0aCh3aWR0aCk7XG4gICAgICBjb250ZXh0LndpZHRoKHdpZHRoKTtcblxuICAgICAgZDMuc2VsZWN0KCcjZm9jdXMnKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmNhbGwoZm9jdXMpO1xuXG4gICAgICBkMy5zZWxlY3QoJyNjb250ZXh0JylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGNvbnRleHQpO1xuICAgIH1cblxuICB9KVxuXG59IiwiLy9BZGFwdGVkIGZyb20gaHR0cDovL2Jvc3Qub2Nrcy5vcmcvbWlrZS9jaGFydC90aW1lLXNlcmllcy1jaGFydC5qc1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuXG5mdW5jdGlvbiBsaW5lQ2hhcnQoKSB7XG5cbiAgdmFyIG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMjAsIGxlZnQ6IDQwfTtcbiAgdmFyIHdpZHRoID0gOTYwXG4gIHZhciBoZWlnaHQgPSA1MDBcbiAgdmFyIHhWYWx1ZSA9IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbMF07IH1cbiAgdmFyIHlWYWx1ZSA9IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbMV07IH1cbiAgdmFyIHggPSBkMy50aW1lLnNjYWxlKCkucmFuZ2UoWzAsIHdpZHRoXSk7XG4gIHZhciB5ID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoW2hlaWdodCwgMF0pO1xuICB2YXIgeFNjYWxlID0gZDMudGltZS5zY2FsZSgpO1xuICB2YXIgeVNjYWxlID0gZDMuc2NhbGUubGluZWFyKCk7XG4gIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeFNjYWxlKS5vcmllbnQoJ2JvdHRvbScpO1xuICB2YXIgbGluZSA9IGQzLnN2Zy5saW5lKCkueChYKS55KFkpO1xuXG4gIHZhciB5UGFkZGluZyA9IDAuMDI1O1xuXG4gIHZhciBhcHBlbmRZQXhpcyA9IGZhbHNlO1xuICB2YXIgeUF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHlTY2FsZSkub3JpZW50KCdsZWZ0JylcblxuICB2YXIgYXBwZW5kRGF0YVBvaW50cyA9IGZhbHNlO1xuXG4gIHZhciBhcHBlbmRCcnVzaCA9IGZhbHNlO1xuICB2YXIgYnJ1c2hEb21haW47XG4gIC8vIHZhciBicnVzaCA9IGQzLnN2Zy5icnVzaCgpLngoWCkub24oJ2JydXNoJywgYnJ1c2hlZClcblxuICBmdW5jdGlvbiBjaGFydChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgIC8vIENvbnZlcnQgZGF0YSB0byBzdGFuZGFyZCByZXByZXNlbnRhdGlvbiBncmVlZGlseTtcbiAgICAgIC8vIHRoaXMgaXMgbmVlZGVkIGZvciBub25kZXRlcm1pbmlzdGljIGFjY2Vzc29ycy5cbiAgICAgIGRhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHJldHVybiBbeFZhbHVlLmNhbGwoZGF0YSwgZCwgaSksIHlWYWx1ZS5jYWxsKGRhdGEsIGQsIGkpXTtcbiAgICAgIH0pO1xuXG4gICAgICBpZihicnVzaERvbWFpbikge1xuICAgICAgICB4U2NhbGVcbiAgICAgICAgICAuZG9tYWluKGJydXNoRG9tYWluKVxuICAgICAgICAgIC5yYW5nZShbMCwgd2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodF0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeFNjYWxlXG4gICAgICAgICAgLmRvbWFpbihkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzBdOyB9KSlcbiAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHRdKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHlFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge3JldHVybiBkWzFdfSlcbiAgICAgIHZhciB5TWluID0geUV4dGVudFswXSAqICgxIC0geVBhZGRpbmcpO1xuICAgICAgdmFyIHlNYXggPSB5RXh0ZW50WzFdICogKDEgKyB5UGFkZGluZylcblxuICAgICAgeVNjYWxlXG4gICAgICAgIC5kb21haW4oW3lNaW4sIHlNYXhdKVxuICAgICAgICAucmFuZ2UoW2hlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tLCAwXSk7XG5cbiAgICAgIC8vU2VsZWN0IHRoZSBzdmcgZWxlbWVudCBpZiBpdCBleGlzdHNcbiAgICAgIHZhciBzdmcgPSBkMy5zZWxlY3QodGhpcykuc2VsZWN0QWxsKCdzdmcnKS5kYXRhKFtkYXRhXSk7XG5cbiAgICAgIC8vT3RoZXJ3aXNlLCBjcmVhdGUgdGhlIHNrZWxldGFsIGNoYXJ0XG4gICAgICB2YXIgZ0VudGVyID0gc3ZnLmVudGVyKCkuYXBwZW5kKCdzdmcnKS5hcHBlbmQoJ2cnKTtcbiAgICAgIGdFbnRlci5hcHBlbmQoJ3BhdGgnKS5hdHRyKCdjbGFzcycsICdsaW5lJyk7XG4gICAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneCBheGlzJyk7XG4gICAgICBnRW50ZXIuYXBwZW5kKCdnJykuYXR0cignY2xhc3MnLCAneSBheGlzJyk7XG5cbiAgICAgIC8vdXBkYXRlIHRoZSBvdXRlciBkaW1lbnNpb25zXG4gICAgICBzdmdcbiAgICAgICAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gICAgICAgIC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQpO1xuXG4gICAgICAvL3VwZGF0ZSB0aGUgaW5uZXIgZGltZW5zaW9uc1xuICAgICAgdmFyIGcgPSBzdmcuc2VsZWN0KCdnJylcbiAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpO1xuXG4gICAgICAvL0FkZCBjbGlwIHBhdGggc28gZGF0YSBkb2Vzbid0IGNyb3NzIGF4aXNcbiAgICAgIHN2Zy5lbnRlcigpLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwiY2xpcFBhdGhcIilcbiAgICAgICAgICAuYXR0cihcImlkXCIsIFwiY2xpcFwiKVxuICAgICAgICAuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblxuXG4gICAgICAvL3VwZGF0ZSB0aGUgbGluZSBwYXRoXG4gICAgICBnLnNlbGVjdCgnLmxpbmUnKVxuICAgICAgICAuYXR0cignZCcsIGxpbmUpO1xuXG5cbiAgICAgIC8vdXBkYXRlIHRoZSBkYXRhIHBvaW50c1xuICAgICAgaWYoYXBwZW5kRGF0YVBvaW50cyA9PT0gdHJ1ZSkge1xuXG4gICAgICAgIGdFbnRlci5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdwb2ludHMnKTtcblxuICAgICAgICBnLnNlbGVjdCgnZy5wb2ludHMnKVxuICAgICAgICAgIC5zZWxlY3RBbGwoJ2NpcmNsZS5wb2ludCcpXG4gICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ3BvaW50JylcbiAgICAgICAgICAuYXR0cigncicsIDMuNSlcblxuICAgICAgICBnLnNlbGVjdEFsbCgnY2lyY2xlLnBvaW50JylcbiAgICAgICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7cmV0dXJuIHhTY2FsZShkWzBdKX0pXG4gICAgICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkge3JldHVybiB5U2NhbGUoZFsxXSl9KVxuICAgICAgfVxuXG4gICAgICAvL3VwZGF0ZSB0aGUgeCBheGlzXG4gICAgICBnLnNlbGVjdCgnLnguYXhpcycpXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsXCIgKyB5U2NhbGUucmFuZ2UoKVswXSArIFwiKVwiKVxuICAgICAgICAuY2FsbCh4QXhpcyk7XG5cbiAgICAgIC8vdXBkYXRlIHRoZSB5IGF4aXNcbiAgICAgIGlmKGFwcGVuZFlBeGlzID09PSB0cnVlKSB7XG4gICAgICAgIGcuc2VsZWN0KCcueS5heGlzJylcbiAgICAgICAgICAuY2FsbCh5QXhpcyk7ICAgICAgICBcbiAgICAgIH1cblxuICAgIH0pXG4gIH1cblxuXG5cbiAgLy8gVGhlIHgtYWNjZXNzb3IgZm9yIHRoZSBwYXRoIGdlbmVyYXRvcjsgeFNjYWxlIOKImCB4VmFsdWUuXG4gIGZ1bmN0aW9uIFgoZCkge1xuICAgIHJldHVybiB4U2NhbGUoZFswXSk7XG4gIH1cblxuICAvLyBUaGUgeC1hY2Nlc3NvciBmb3IgdGhlIHBhdGggZ2VuZXJhdG9yOyB5U2NhbGUg4oiYIHlWYWx1ZS5cbiAgZnVuY3Rpb24gWShkKSB7XG4gICAgcmV0dXJuIHlTY2FsZShkWzFdKTtcbiAgfVxuXG4gIGNoYXJ0Lm1hcmdpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtYXJnaW47XG4gICAgbWFyZ2luID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQud2lkdGggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gd2lkdGg7XG4gICAgd2lkdGggPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5oZWlnaHQgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaGVpZ2h0O1xuICAgIGhlaWdodCA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geFZhbHVlO1xuICAgIHhWYWx1ZSA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnkgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geVZhbHVlO1xuICAgIHlWYWx1ZSA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmFwcGVuZEJydXNoID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYnJ1c2g7XG4gICAgYnJ1c2ggPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5hcHBlbmRZQXhpcyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJydXNoO1xuICAgIGFwcGVuZFlBeGlzID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuYXBwZW5kRGF0YVBvaW50cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJydXNoO1xuICAgIGFwcGVuZERhdGFQb2ludHMgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfVxuXG4gIGNoYXJ0LnhTY2FsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHhTY2FsZTtcbiAgICB4U2NhbGUgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfVxuXG4gIGNoYXJ0LmJydXNoRG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYnJ1c2hEb21haW47XG4gICAgYnJ1c2hEb21haW4gPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfVxuXG4gIGNoYXJ0LnlQYWRkaW5nID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geVBhZGRpbmc7XG4gICAgeVBhZGRpbmcgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfVxuXG4gIHJldHVybiBjaGFydDtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpbmVDaGFydDsiLCJ2YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuXG5mdW5jdGlvbiB0YWJ1bGF0ZSgpIHtcblxuICBmdW5jdGlvbiBjYXBpdGFsaXplKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvKD86XnxcXHMpXFxTL2csIGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGEudG9VcHBlckNhc2UoKTsgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB0YWJsZShzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgIC8vQ3JlYXRlIGFycmF5IG9mIGNvbHVtbnMgZnJvbSBkYXRhIGtleXNcbiAgICAgIHZhciBjb2x1bW5zID0gW11cbiAgICAgIHZhciBkYXRhU2FtcGxlID0gZGF0YVswXTtcblxuICAgICAgZm9yKGtleSBpbiBkYXRhU2FtcGxlKSB7XG4gICAgICAgIGNvbHVtbnMucHVzaChrZXkpO1xuICAgICAgfVxuXG4gICAgICAvL0NyZWF0ZSBhcnJheSBvZiBkYXRhXG4gICAgICBjZWxsRGF0YSA9IGRhdGEubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7XG4gICAgICAgICAgcmV0dXJuIHtjb2x1bW46IGNvbHVtbiwgdmFsdWU6IHJvd1tjb2x1bW5dfVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgLy9TZWxlY3QgdGhlIHN2ZyBlbGVtZW50IGlmIGl0IGV4aXN0c1xuICAgICAgdmFyIHRhYmxlID0gZDMuc2VsZWN0KHRoaXMpLnNlbGVjdEFsbCgndGFibGUnKS5kYXRhKFtkYXRhXSk7XG5cbiAgICAgIHZhciB0RW50ZXIgPSB0YWJsZS5lbnRlcigpLmFwcGVuZCgndGFibGUnKTtcbiAgICAgIHZhciB0aGVhZCA9IHRFbnRlci5hcHBlbmQoJ3RoZWFkJyk7XG4gICAgICB2YXIgdGJvZHkgPSB0RW50ZXIuYXBwZW5kKCd0Ym9keScpO1xuXG5cbiAgICAgIC8vQXBwZW5kIGhlYWRlciByb3dcbiAgICAgIHRoZWFkLmFwcGVuZCgndHInKVxuICAgICAgICAuc2VsZWN0QWxsKCd0aCcpXG4gICAgICAgIC5kYXRhKGNvbHVtbnMpXG4gICAgICAgIC5lbnRlcigpXG4gICAgICAgIC5hcHBlbmQoJ3RoJylcbiAgICAgICAgLnRleHQoZnVuY3Rpb24oY29sdW1uKSB7cmV0dXJuIGNhcGl0YWxpemUoY29sdW1uKTt9KTtcblxuXG4gICAgICAvL0NyZWF0ZSBSb3dzXG4gICAgICB2YXIgcm93cyA9IHRib2R5LnNlbGVjdEFsbCgndHInKVxuICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0cicpO1xuXG4gICAgICAvL0NyZWF0ZSBjZWxscyBpbiBlYWNoIHJvdyBmb3IgZWFjaCBjb2x1bW5cbiAgICAgIHZhciBjZWxscyA9IHJvd3Muc2VsZWN0QWxsKCd0ZCcpXG4gICAgICAgIC5kYXRhKGZ1bmN0aW9uKHJvdykge1xuICAgICAgICAgIHJldHVybiBjb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4pIHtcbiAgICAgICAgICAgIHJldHVybiB7Y29sdW1uOiBjb2x1bW4sIHZhbHVlOiByb3dbY29sdW1uXX1cbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKCd0ZCcpXG4gICAgICAgIC5odG1sKGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudmFsdWUgfSk7XG4gICAgfSlcblxuICB9XG5cbiAgcmV0dXJuIHRhYmxlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGFidWxhdGU7XG5cblxuIiwidmFyIGlvID0gcmVxdWlyZSgnc29ja2V0LmlvLWNsaWVudCcpO1xudmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuXG5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byB3ZWJzb2NrZXRzJyk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzb2NrZXQ7XG5cblxuIl19
