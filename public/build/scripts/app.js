(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./chart.js')();
},{"./chart.js":2}],2:[function(require,module,exports){
var d3 = require('d3');

module.exports = function() {
  'use strict';

  var margin = {top: 20, right: 20, bottom: 30, left: 40};
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
      .attr('transform', 'translate(0,' + height + ')');

    svg.append('g')
      .attr('class', 'y axis')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9jaGFydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoJy4vY2hhcnQuanMnKSgpOyIsInZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgbWFyZ2luID0ge3RvcDogMjAsIHJpZ2h0OiAyMCwgYm90dG9tOiAzMCwgbGVmdDogNDB9O1xuICB2YXIgd2lkdGggPSA5NjAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcbiAgdmFyIGhlaWdodCA9IDUwMCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xuXG4gIHZhciB4ID0gZDMudGltZS5zY2FsZSgpXG4gICAgLnJhbmdlKFswLCB3aWR0aF0pO1xuXG4gIHZhciB5ID0gZDMuc2NhbGUubGluZWFyKClcbiAgICAucmFuZ2UoW2hlaWdodCwgMF0pO1xuXG4gIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgICAuc2NhbGUoeClcbiAgICAub3JpZW50KCdib3R0b20nKTtcblxuICB2YXIgeUF4aXMgPSBkMy5zdmcuYXhpcygpXG4gICAgLnNjYWxlKHkpXG4gICAgLm9yaWVudCgnbGVmdCcpO1xuXG5cblxuICB2YXIgc3ZnID0gZDMuc2VsZWN0KCdib2R5JykuYXBwZW5kKCdzdmcnKVxuICAgIC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXG4gICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxuICAgIC5hcHBlbmQoJ2cnKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIik7XG5cbiAgdmFyIGxpbmUgPSBkMy5zdmcubGluZSgpXG4gICAgLmludGVycG9sYXRlKFwic3RlcC1hZnRlclwiKVxuICAgIC54KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHgoZC50aW1lKTsgfSlcbiAgICAueShmdW5jdGlvbihkKSB7IHJldHVybiB5KGQubGFzdFByaWNlKTsgfSk7XG5cbiAgdmFyIHpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAub24oXCJ6b29tXCIsIGRyYXcpO1xuXG4gIHN2Zy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInBhbmVcIilcbiAgICAuYXR0cihcIndpZHRoXCIsIHdpZHRoKVxuICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodClcbiAgICAuY2FsbCh6b29tKTtcblxuICBkMy5qc29uKCcvcHJpY2VzJywgZnVuY3Rpb24oZXJyLCBkYXRhKSB7XG4gICAgdmFyIHBhcnNlZERhdGEgPSBkYXRhLnByaWNlcy5tYXAoZnVuY3Rpb24oZGF0dW0pIHtcbiAgICAgIGRhdHVtLnRpbWUgPSBuZXcgRGF0ZShkYXR1bS50aW1lKTtcbiAgICAgIHJldHVybiBkYXR1bTtcbiAgICB9KTtcblxuICAgIGJ1aWxkQ2hhcnQocGFyc2VkRGF0YSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGJ1aWxkQ2hhcnQoZGF0YSkge1xuICAgIHZhciBjdXJyZW50VGltZSA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIHRpbWVNaW4gPSBuZXcgRGF0ZSgpO1xuICAgIHRpbWVNaW4uc2V0SG91cnMoY3VycmVudFRpbWUuZ2V0SG91cnMoKSAtIDEpO1xuXG4gICAgeC5kb21haW4oW3RpbWVNaW4sIGN1cnJlbnRUaW1lXSk7XG5cbiAgICB2YXIgcHJpY2VFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQubGFzdFByaWNlO1xuICAgIH0pO1xuXG4gICAgeS5kb21haW4oW3ByaWNlRXh0ZW50WzBdIC0gMjUsIHByaWNlRXh0ZW50WzBdICsgMjVdKTtcbiAgICB6b29tLngoeCk7XG5cbiAgICBzdmcuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICd4IGF4aXMnKVxuICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwnICsgaGVpZ2h0ICsgJyknKTtcblxuICAgIHN2Zy5hcHBlbmQoJ2cnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ3kgYXhpcycpXG4gICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAncm90YXRlKC05MCknKVxuICAgICAgLmF0dHIoJ3knLCA2KVxuICAgICAgLmF0dHIoJ2R5JywgJy43MWVtJylcbiAgICAgIC5zdHlsZSgndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgIC50ZXh0KCdMYXN0IFByaWNlICgkKScpO1xuXG4gICAgc3ZnLnNlbGVjdEFsbCgnLmRvdCcpXG4gICAgICAuZGF0YShkYXRhKVxuICAgICAgLmVudGVyKCkuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ2RvdCcpXG4gICAgICAuYXR0cigncicsIDMuNSlcbiAgICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIHgoZC50aW1lKTtcbiAgICAgIH0pXG4gICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiB5KGQubGFzdFByaWNlKTtcbiAgICAgIH0pO1xuXG4gICAgc3ZnLmFwcGVuZChcInBhdGhcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsaW5lXCIpXG5cbiAgICBzdmcuc2VsZWN0KFwicGF0aC5saW5lXCIpLmRhdGEoW2RhdGFdKTtcblxuXG4gICAgZHJhdygpO1xuXG4gIH1cblxuICBmdW5jdGlvbiBkcmF3KCkge1xuICAgIHN2Zy5zZWxlY3QoXCJnLnguYXhpc1wiKS5jYWxsKHhBeGlzKTtcbiAgICBzdmcuc2VsZWN0KFwiZy55LmF4aXNcIikuY2FsbCh5QXhpcyk7XG4gICAgc3ZnLnNlbGVjdChcInBhdGgubGluZVwiKS5hdHRyKFwiZFwiLCBsaW5lKTtcblxuICAgIHN2Zy5zZWxlY3RBbGwoJy5kb3QnKVxuICAgIC5hdHRyKCdjbGFzcycsICdkb3QnKVxuICAgIC5hdHRyKCdyJywgMy41KVxuICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiB4KGQudGltZSk7XG4gICAgfSlcbiAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4geShkLmxhc3RQcmljZSk7XG4gICAgfSk7XG4gIH1cblxuICBcbn07Il19
