var d3 = require('d3');

module.exports = function() {
  'use strict';

  var margin = {top: 20, right: 20, bottom: 30, left: 100};
  var width = 960 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  var x = d3.time.scale()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');

  var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var zoom = d3.behavior.zoom()
    .on("zoom", draw);

  svg.append("rect")
    .attr("class", "pane")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

  d3.json('/prices', function(err, data) {
    var parsedData = data.prices.map(function(datum) {
      datum.time = new Date(datum.time);
      return datum;
    });

    buildChart(parsedData);
  });

  function buildChart(data) {
    var sample = data.reverse().slice(0, 20)

    var timeExtent = d3.extent(sample, function(d) {
      return new Date(d.time);
    });

    var priceExtent = d3.extent(data, function(d) {
      return d.lastPrice;
    });

    x.domain(timeExtent);
    y.domain([priceExtent[0] - 25, priceExtent[0] + 25]);
    zoom.x(x);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Last Price ($)');

    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('r', 3.5)
      .attr('cx', function(d) {
        return x(d.time);
      })
      .attr('cy', function(d) {
        return y(d.lastPrice);
      });


    draw();

  }

  function draw() {
    svg.select("g.x.axis").call(xAxis);
    svg.select("g.y.axis").call(yAxis);
    // svg.select("path.area").attr("d", area);
    // svg.select("path.line").attr("d", line);
  }

  
};