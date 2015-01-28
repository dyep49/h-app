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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvbGluZWNoYXJ0LmpzIiwicHVibGljL3NyYy9zY3JpcHRzL3dlYnNvY2tldHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHJlcXVpcmUoJy4vY2hhcnQuanMnKSgpO1xuLy8gcmVxdWlyZSgnLi9jaGFydHMuanMnKSgpO1xucmVxdWlyZSgnLi93ZWJzb2NrZXRzLmpzJyk7XG5cbnJlcXVpcmUoJy4vZDMtY2hhcnRzLmpzJykoKTsiLCIvL0FkYXB0ZWQgZnJvbSBodHRwOi8vYmwub2Nrcy5vcmcvbWJvc3RvY2svMTY2NzM2N1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xudmFyIGxpbmVDaGFydCA9IHJlcXVpcmUoJy4vbGluZWNoYXJ0LmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgdmFyIHdpZHRoID0gcGFyc2VJbnQoZDMuc2VsZWN0KCcuY29udGVudC1jb250YWluZXInKS5zdHlsZSgnd2lkdGgnKSlcblxuICBkMy5qc29uKCcvcHJpY2VzJywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgZGF0YSA9IGRhdGEucHJpY2VzLm1hcChmdW5jdGlvbihkKSB7XG4gICAgICB2YXIgcGFyc2VkRGF0dW0gPSB7fVxuICAgICAgcGFyc2VkRGF0dW0udGltZSA9IG5ldyBEYXRlKGQudGltZSk7XG4gICAgICBwYXJzZWREYXR1bS5wcmljZSA9ICtkLmxhc3RQcmljZTtcbiAgICAgIHJldHVybiBwYXJzZWREYXR1bTtcbiAgICB9KTtcblxuICAgIHZhciBjb250ZXh0ID0gbGluZUNoYXJ0KCkgICAgXG4gICAgICAueChmdW5jdGlvbihkKSB7cmV0dXJuIGQudGltZX0pXG4gICAgICAueShmdW5jdGlvbihkKSB7cmV0dXJuIGQucHJpY2V9KVxuICAgICAgLmhlaWdodCgxMDApXG4gICAgICAud2lkdGgod2lkdGgpO1xuXG5cbiAgICB2YXIgZm9jdXMgPSBsaW5lQ2hhcnQoKVxuICAgICAgLngoZnVuY3Rpb24oZCkge3JldHVybiBkLnRpbWV9KVxuICAgICAgLnkoZnVuY3Rpb24oZCkge3JldHVybiBkLnByaWNlfSlcbiAgICAgIC53aWR0aCh3aWR0aClcbiAgICAgIC5tYXJnaW4oe3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAzMCwgbGVmdDogNDB9KVxuICAgICAgLmFwcGVuZFlBeGlzKHRydWUpXG4gICAgICAuYXBwZW5kRGF0YVBvaW50cyh0cnVlKTtcblxuXG4gICAgZDMuc2VsZWN0KCcjZm9jdXMnKVxuICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAuY2FsbChmb2N1cyk7XG5cbiAgICBkMy5zZWxlY3QoJyNjb250ZXh0JylcbiAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgLmNhbGwoY29udGV4dCk7XG5cbiAgICAvL0FkZGluZyBicnVzaCB0byB0aGUgY29udGV4dCBjaGFydFxuICAgIHZhciBicnVzaCA9IGQzLnN2Zy5icnVzaCgpXG4gICAgICAueChjb250ZXh0LnhTY2FsZSgpKVxuICAgICAgLm9uKCdicnVzaCcsIGJydXNoZWQpO1xuXG4gICAgZDMuc2VsZWN0KCcjY29udGV4dCBzdmcnKVxuICAgICAgLmFwcGVuZCgnZycpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBicnVzaFwiKVxuICAgICAgLmNhbGwoYnJ1c2gpXG4gICAgICAuc2VsZWN0QWxsKFwicmVjdFwiKVxuICAgICAgLmF0dHIoXCJ5XCIsIC02KVxuICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgY29udGV4dC5oZWlnaHQoKSArIDcpO1xuXG4gICAgZnVuY3Rpb24gYnJ1c2hlZCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdicnVzaCcpO1xuICAgICAgaWYoIWJydXNoLmVtcHR5KCkpIHtcbiAgICAgICAgZm9jdXMuYnJ1c2hEb21haW4oYnJ1c2guZXh0ZW50KCkpO1xuXG4gICAgICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgICAuY2FsbChmb2N1cyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZDMuc2VsZWN0KHdpbmRvdykub24oJ3Jlc2l6ZScsIHJlc2l6ZSlcblxuICAgIGZ1bmN0aW9uIHJlc2l6ZSgpIHtcbiAgICAgIHdpZHRoID0gcGFyc2VJbnQoZDMuc2VsZWN0KCcuY29udGVudC1jb250YWluZXInKS5zdHlsZSgnd2lkdGgnKSlcbiAgICAgIFxuICAgICAgZm9jdXMud2lkdGgod2lkdGgpO1xuICAgICAgY29udGV4dC53aWR0aCh3aWR0aCk7XG5cbiAgICAgIGQzLnNlbGVjdCgnI2ZvY3VzJylcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5jYWxsKGZvY3VzKTtcblxuICAgICAgZDMuc2VsZWN0KCcjY29udGV4dCcpXG4gICAgICAgIC5kYXR1bShkYXRhKVxuICAgICAgICAuY2FsbChjb250ZXh0KTtcblxuXG4gICAgfVxuICB9KVxuXG59IiwiLy9BZGFwdGVkIGZyb20gaHR0cDovL2Jvc3Qub2Nrcy5vcmcvbWlrZS9jaGFydC90aW1lLXNlcmllcy1jaGFydC5qc1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuXG5mdW5jdGlvbiBsaW5lQ2hhcnQoKSB7XG5cbiAgdmFyIG1hcmdpbiA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMjAsIGxlZnQ6IDQwfTtcbiAgdmFyIHdpZHRoID0gOTYwXG4gIHZhciBoZWlnaHQgPSA1MDBcbiAgdmFyIHhWYWx1ZSA9IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbMF07IH1cbiAgdmFyIHlWYWx1ZSA9IGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGRbMV07IH1cbiAgdmFyIHggPSBkMy50aW1lLnNjYWxlKCkucmFuZ2UoWzAsIHdpZHRoXSk7XG4gIHZhciB5ID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoW2hlaWdodCwgMF0pO1xuICB2YXIgeFNjYWxlID0gZDMudGltZS5zY2FsZSgpO1xuICB2YXIgeVNjYWxlID0gZDMuc2NhbGUubGluZWFyKCk7XG4gIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeFNjYWxlKS5vcmllbnQoJ2JvdHRvbScpO1xuICB2YXIgbGluZSA9IGQzLnN2Zy5saW5lKCkueChYKS55KFkpO1xuXG4gIHZhciBhcHBlbmRZQXhpcyA9IGZhbHNlO1xuICB2YXIgeUF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHlTY2FsZSkub3JpZW50KCdsZWZ0JylcblxuICB2YXIgYXBwZW5kRGF0YVBvaW50cyA9IGZhbHNlO1xuXG4gIHZhciBhcHBlbmRCcnVzaCA9IGZhbHNlO1xuICB2YXIgYnJ1c2hEb21haW47XG4gIC8vIHZhciBicnVzaCA9IGQzLnN2Zy5icnVzaCgpLngoWCkub24oJ2JydXNoJywgYnJ1c2hlZClcblxuICBmdW5jdGlvbiBjaGFydChzZWxlY3Rpb24pIHtcbiAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbihkYXRhKSB7XG5cbiAgICAgIC8vIENvbnZlcnQgZGF0YSB0byBzdGFuZGFyZCByZXByZXNlbnRhdGlvbiBncmVlZGlseTtcbiAgICAgIC8vIHRoaXMgaXMgbmVlZGVkIGZvciBub25kZXRlcm1pbmlzdGljIGFjY2Vzc29ycy5cbiAgICAgIGRhdGEgPSBkYXRhLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHJldHVybiBbeFZhbHVlLmNhbGwoZGF0YSwgZCwgaSksIHlWYWx1ZS5jYWxsKGRhdGEsIGQsIGkpXTtcbiAgICAgIH0pO1xuXG4gICAgICBpZihicnVzaERvbWFpbikge1xuICAgICAgICBjb25zb2xlLmxvZyhicnVzaERvbWFpbik7XG4gICAgICAgIHhTY2FsZVxuICAgICAgICAgIC5kb21haW4oYnJ1c2hEb21haW4pXG4gICAgICAgICAgLnJhbmdlKFswLCB3aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB4U2NhbGVcbiAgICAgICAgICAuZG9tYWluKGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7cmV0dXJuIGRbMF07IH0pKVxuICAgICAgICAgIC5yYW5nZShbMCwgd2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodF0pO1xuICAgICAgfVxuICAgICAgeVNjYWxlXG4gICAgICAgIC5kb21haW4oZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZFsxXTsgfSkpXG4gICAgICAgIC5yYW5nZShbaGVpZ2h0IC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b20sIDBdKTtcblxuICAgICAgLy9TZWxlY3QgdGhlIHN2ZyBlbGVtZW50IGlmIGl0IGV4aXN0c1xuICAgICAgdmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzKS5zZWxlY3RBbGwoJ3N2ZycpLmRhdGEoW2RhdGFdKTtcblxuICAgICAgLy9PdGhlcndpc2UsIGNyZWF0ZSB0aGUgc2tlbGV0YWwgY2hhcnRcbiAgICAgIHZhciBnRW50ZXIgPSBzdmcuZW50ZXIoKS5hcHBlbmQoJ3N2ZycpLmFwcGVuZCgnZycpO1xuICAgICAgZ0VudGVyLmFwcGVuZCgncGF0aCcpLmF0dHIoJ2NsYXNzJywgJ2xpbmUnKTtcbiAgICAgIGdFbnRlci5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICd4IGF4aXMnKTtcbiAgICAgIGdFbnRlci5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICd5IGF4aXMnKTtcblxuICAgICAgLy91cGRhdGUgdGhlIG91dGVyIGRpbWVuc2lvbnNcbiAgICAgIHN2Z1xuICAgICAgICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgICAgIC8vdXBkYXRlIHRoZSBpbm5lciBkaW1lbnNpb25zXG4gICAgICB2YXIgZyA9IHN2Zy5zZWxlY3QoJ2cnKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIik7XG5cbiAgICAgIC8vQWRkIGNsaXAgcGF0aCBzbyBkYXRhIGRvZXNuJ3QgY3Jvc3MgYXhpc1xuICAgICAgc3ZnLmFwcGVuZChcImRlZnNcIikuYXBwZW5kKFwiY2xpcFBhdGhcIilcbiAgICAgICAgICAuYXR0cihcImlkXCIsIFwiY2xpcFwiKVxuICAgICAgICAuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KTtcblxuXG4gICAgICAvL3VwZGF0ZSB0aGUgbGluZSBwYXRoXG4gICAgICBnLnNlbGVjdCgnLmxpbmUnKVxuICAgICAgICAuYXR0cignZCcsIGxpbmUpO1xuXG5cbiAgICAgIC8vdXBkYXRlIHRoZSBkYXRhIHBvaW50c1xuICAgICAgaWYoYXBwZW5kRGF0YVBvaW50cyA9PT0gdHJ1ZSkge1xuXG4gICAgICAgIGdFbnRlci5hcHBlbmQoJ2cnKS5hdHRyKCdjbGFzcycsICdwb2ludHMnKTtcblxuICAgICAgICBnLnNlbGVjdCgnZy5wb2ludHMnKVxuICAgICAgICAgIC5zZWxlY3RBbGwoJ2NpcmNsZS5wb2ludCcpXG4gICAgICAgICAgLmRhdGEoZGF0YSlcbiAgICAgICAgICAuZW50ZXIoKVxuICAgICAgICAgIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ3BvaW50JylcbiAgICAgICAgICAuYXR0cigncicsIDMuNSlcblxuICAgICAgICBnLnNlbGVjdEFsbCgnY2lyY2xlLnBvaW50JylcbiAgICAgICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7cmV0dXJuIHhTY2FsZShkWzBdKX0pXG4gICAgICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkge3JldHVybiB5U2NhbGUoZFsxXSl9KVxuICAgICAgfVxuXG4gICAgICAvL3VwZGF0ZSB0aGUgeCBheGlzXG4gICAgICBnLnNlbGVjdCgnLnguYXhpcycpXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKDAsXCIgKyB5U2NhbGUucmFuZ2UoKVswXSArIFwiKVwiKVxuICAgICAgICAuY2FsbCh4QXhpcyk7XG5cbiAgICAgIC8vdXBkYXRlIHRoZSB5IGF4aXNcbiAgICAgIGlmKGFwcGVuZFlBeGlzID09PSB0cnVlKSB7XG4gICAgICAgIGcuc2VsZWN0KCcueS5heGlzJylcbiAgICAgICAgICAuY2FsbCh5QXhpcyk7ICAgICAgICBcbiAgICAgIH1cblxuICAgIH0pXG4gIH1cblxuXG5cbiAgLy8gVGhlIHgtYWNjZXNzb3IgZm9yIHRoZSBwYXRoIGdlbmVyYXRvcjsgeFNjYWxlIOKImCB4VmFsdWUuXG4gIGZ1bmN0aW9uIFgoZCkge1xuICAgIHJldHVybiB4U2NhbGUoZFswXSk7XG4gIH1cblxuICAvLyBUaGUgeC1hY2Nlc3NvciBmb3IgdGhlIHBhdGggZ2VuZXJhdG9yOyB5U2NhbGUg4oiYIHlWYWx1ZS5cbiAgZnVuY3Rpb24gWShkKSB7XG4gICAgcmV0dXJuIHlTY2FsZShkWzFdKTtcbiAgfVxuXG4gIGNoYXJ0Lm1hcmdpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtYXJnaW47XG4gICAgbWFyZ2luID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQud2lkdGggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gd2lkdGg7XG4gICAgd2lkdGggPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5oZWlnaHQgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaGVpZ2h0O1xuICAgIGhlaWdodCA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnggPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geFZhbHVlO1xuICAgIHhWYWx1ZSA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LnkgPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geVZhbHVlO1xuICAgIHlWYWx1ZSA9IF87XG4gICAgcmV0dXJuIGNoYXJ0O1xuICB9O1xuXG4gIGNoYXJ0LmFwcGVuZEJydXNoID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYnJ1c2g7XG4gICAgYnJ1c2ggPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfTtcblxuICBjaGFydC5hcHBlbmRZQXhpcyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJydXNoO1xuICAgIGFwcGVuZFlBeGlzID0gXztcbiAgICByZXR1cm4gY2hhcnQ7XG4gIH07XG5cbiAgY2hhcnQuYXBwZW5kRGF0YVBvaW50cyA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJydXNoO1xuICAgIGFwcGVuZERhdGFQb2ludHMgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfVxuXG4gIGNoYXJ0LnhTY2FsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICBpZighYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHhTY2FsZTtcbiAgICB4U2NhbGUgPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfVxuXG4gIGNoYXJ0LmJydXNoRG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIGlmKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYnJ1c2hEb21haW47XG4gICAgYnJ1c2hEb21haW4gPSBfO1xuICAgIHJldHVybiBjaGFydDtcbiAgfVxuXG4gIHJldHVybiBjaGFydDtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpbmVDaGFydDsiLCJ2YXIgaW8gPSByZXF1aXJlKCdzb2NrZXQuaW8tY2xpZW50Jyk7XG52YXIgc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovL2xvY2FsaG9zdDo0MDAwJyk7XG5cbnNvY2tldC5vbignY29ubmVjdCcsIGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnY29ubmVjdGVkIHRvIHdlYnNvY2tldHMnKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNvY2tldDtcblxuXG4iXX0=
