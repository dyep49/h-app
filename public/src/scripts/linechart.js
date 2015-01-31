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
      debugger;
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