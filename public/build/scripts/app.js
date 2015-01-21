(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./chart.js')();
},{"./chart.js":2}],2:[function(require,module,exports){
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
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var line = d3.svg.line()
    .interpolate("step-after")
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.lastPrice); });

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
    var currentTime = new Date();
    var timeMin = new Date();
    timeMin.setHours(currentTime.getHours() - 1);

    x.domain([timeMin, currentTime]);

    var priceExtent = d3.extent(data, function(d) {
      return d.lastPrice;
    });

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

    svg.append("path")
    .attr("class", "line")

    svg.select("path.line").data([data]);


    draw();

  }

  function draw() {
    svg.select("g.x.axis").call(xAxis);
    svg.select("g.y.axis").call(yAxis);
    svg.select("path.line").attr("d", line);

    svg.selectAll('.dot')
    .attr('class', 'dot')
    .attr('r', 3.5)
    .attr('cx', function(d) {
      return x(d.time);
    })
    .attr('cy', function(d) {
      return y(d.lastPrice);
    });
  }

  
};
},{"d3":"d3"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9jaGFydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoJy4vY2hhcnQuanMnKSgpOyIsInZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgbWFyZ2luID0ge3RvcDogMjAsIHJpZ2h0OiAyMCwgYm90dG9tOiAzMCwgbGVmdDogMTAwfTtcbiAgdmFyIHdpZHRoID0gOTYwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XG4gIHZhciBoZWlnaHQgPSA1MDAgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcblxuICB2YXIgeCA9IGQzLnRpbWUuc2NhbGUoKVxuICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcblxuICB2YXIgeSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgLnJhbmdlKFtoZWlnaHQsIDBdKTtcblxuICB2YXIgeEF4aXMgPSBkMy5zdmcuYXhpcygpXG4gICAgLnNjYWxlKHgpXG4gICAgLm9yaWVudCgnYm90dG9tJyk7XG5cbiAgdmFyIHlBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgIC5zY2FsZSh5KVxuICAgIC5vcmllbnQoJ2xlZnQnKTtcblxuICB2YXIgc3ZnID0gZDMuc2VsZWN0KCdib2R5JykuYXBwZW5kKCdzdmcnKVxuICAgIC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXG4gICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxuICAgIC5hcHBlbmQoJ2cnKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIik7XG5cbiAgdmFyIGxpbmUgPSBkMy5zdmcubGluZSgpXG4gICAgLmludGVycG9sYXRlKFwic3RlcC1hZnRlclwiKVxuICAgIC54KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHgoZC50aW1lKTsgfSlcbiAgICAueShmdW5jdGlvbihkKSB7IHJldHVybiB5KGQubGFzdFByaWNlKTsgfSk7XG5cbiAgdmFyIHpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAub24oXCJ6b29tXCIsIGRyYXcpO1xuXG4gIHN2Zy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInBhbmVcIilcbiAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcbiAgICAuY2FsbCh6b29tKTtcblxuICBkMy5qc29uKCcvcHJpY2VzJywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgdmFyIHBhcnNlZERhdGEgPSBkYXRhLnByaWNlcy5tYXAoZnVuY3Rpb24oZGF0dW0pIHtcbiAgICAgIGRhdHVtLnRpbWUgPSBuZXcgRGF0ZShkYXR1bS50aW1lKTtcbiAgICAgIHJldHVybiBkYXR1bTtcbiAgICB9KTtcblxuICAgIGJ1aWxkQ2hhcnQocGFyc2VkRGF0YSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGJ1aWxkQ2hhcnQoZGF0YSkge1xuICAgIHZhciBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIHRpbWVNaW4gPSBuZXcgRGF0ZSgpO1xuICAgIHRpbWVNaW4uc2V0SG91cnMoY3VycmVudFRpbWUuZ2V0SG91cnMoKSAtIDEpO1xuXG4gICAgeC5kb21haW4oW3RpbWVNaW4sIGN1cnJlbnRUaW1lXSk7XG5cbiAgICB2YXIgcHJpY2VFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQubGFzdFByaWNlO1xuICAgIH0pO1xuXG4gICAgeS5kb21haW4oW3ByaWNlRXh0ZW50WzBdIC0gMjUsIHByaWNlRXh0ZW50WzBdICsgMjVdKTtcbiAgICB6b29tLngoeCk7XG5cbiAgICBzdmcuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICd4IGF4aXMnKVxuICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwnICsgaGVpZ2h0ICsgJyknKVxuICAgICAgLmNhbGwoeEF4aXMpO1xuXG4gICAgc3ZnLmFwcGVuZCgnZycpXG4gICAgICAuYXR0cignY2xhc3MnLCAneSBheGlzJylcbiAgICAgIC5jYWxsKHlBeGlzKVxuICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3JvdGF0ZSgtOTApJylcbiAgICAgIC5hdHRyKCd5JywgNilcbiAgICAgIC5hdHRyKCdkeScsICcuNzFlbScpXG4gICAgICAuc3R5bGUoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAudGV4dCgnTGFzdCBQcmljZSAoJCknKTtcblxuICAgIHN2Zy5zZWxlY3RBbGwoJy5kb3QnKVxuICAgICAgLmRhdGEoZGF0YSlcbiAgICAgIC5lbnRlcigpLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdkb3QnKVxuICAgICAgLmF0dHIoJ3InLCAzLjUpXG4gICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiB4KGQudGltZSk7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4geShkLmxhc3RQcmljZSk7XG4gICAgICB9KTtcblxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImxpbmVcIilcblxuICAgIHN2Zy5zZWxlY3QoXCJwYXRoLmxpbmVcIikuZGF0YShbZGF0YV0pO1xuXG5cbiAgICBkcmF3KCk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgc3ZnLnNlbGVjdChcImcueC5heGlzXCIpLmNhbGwoeEF4aXMpO1xuICAgIHN2Zy5zZWxlY3QoXCJnLnkuYXhpc1wiKS5jYWxsKHlBeGlzKTtcbiAgICBzdmcuc2VsZWN0KFwicGF0aC5saW5lXCIpLmF0dHIoXCJkXCIsIGxpbmUpO1xuXG4gICAgc3ZnLnNlbGVjdEFsbCgnLmRvdCcpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ2RvdCcpXG4gICAgLmF0dHIoJ3InLCAzLjUpXG4gICAgLmF0dHIoJ2N4JywgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIHgoZC50aW1lKTtcbiAgICB9KVxuICAgIC5hdHRyKCdjeScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiB5KGQubGFzdFByaWNlKTtcbiAgICB9KTtcbiAgfVxuXG4gIFxufTsiXX0=
