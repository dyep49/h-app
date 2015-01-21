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



  var svg = d3.select('.chart-container').append('svg')
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

  // d3.json('/prices', function(err, data) {
  //   var parsedData = data.prices.map(function(datum) {
  //     datum.time = new Date(datum.time);
  //     return datum;
  //   });

  //   buildChart(parsedData);
  // });

  var parsedData = JSON.parse(prices).map(function(datum) {
    datum.time = new Date(datum.time);
    return datum;
  });

  buildChart(parsedData);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9jaGFydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZSgnLi9jaGFydC5qcycpKCk7IiwidmFyIGQzID0gcmVxdWlyZSgnZDMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtYXJnaW4gPSB7dG9wOiAyMCwgcmlnaHQ6IDIwLCBib3R0b206IDMwLCBsZWZ0OiA0MH07XG4gIHZhciB3aWR0aCA9IDk2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xuICB2YXIgaGVpZ2h0ID0gNTAwIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XG5cbiAgdmFyIHggPSBkMy50aW1lLnNjYWxlKClcbiAgICAucmFuZ2UoWzAsIHdpZHRoXSk7XG5cbiAgdmFyIHkgPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgIC5yYW5nZShbaGVpZ2h0LCAwXSk7XG5cbiAgdmFyIHhBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgIC5zY2FsZSh4KVxuICAgIC5vcmllbnQoJ2JvdHRvbScpO1xuXG4gIHZhciB5QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgICAuc2NhbGUoeSlcbiAgICAub3JpZW50KCdsZWZ0Jyk7XG5cblxuXG4gIHZhciBzdmcgPSBkMy5zZWxlY3QoJy5jaGFydC1jb250YWluZXInKS5hcHBlbmQoJ3N2ZycpXG4gICAgLmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcbiAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXG4gICAgLmFwcGVuZCgnZycpXG4gICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKTtcblxuICB2YXIgbGluZSA9IGQzLnN2Zy5saW5lKClcbiAgICAuaW50ZXJwb2xhdGUoXCJzdGVwLWFmdGVyXCIpXG4gICAgLngoZnVuY3Rpb24oZCkgeyByZXR1cm4geChkLnRpbWUpOyB9KVxuICAgIC55KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHkoZC5sYXN0UHJpY2UpOyB9KTtcblxuICB2YXIgem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgIC5vbihcInpvb21cIiwgZHJhdyk7XG5cbiAgc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwicGFuZVwiKVxuICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgIC5jYWxsKHpvb20pO1xuXG4gIC8vIGQzLmpzb24oJy9wcmljZXMnLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgLy8gICB2YXIgcGFyc2VkRGF0YSA9IGRhdGEucHJpY2VzLm1hcChmdW5jdGlvbihkYXR1bSkge1xuICAvLyAgICAgZGF0dW0udGltZSA9IG5ldyBEYXRlKGRhdHVtLnRpbWUpO1xuICAvLyAgICAgcmV0dXJuIGRhdHVtO1xuICAvLyAgIH0pO1xuXG4gIC8vICAgYnVpbGRDaGFydChwYXJzZWREYXRhKTtcbiAgLy8gfSk7XG5cbiAgdmFyIHBhcnNlZERhdGEgPSBKU09OLnBhcnNlKHByaWNlcykubWFwKGZ1bmN0aW9uKGRhdHVtKSB7XG4gICAgZGF0dW0udGltZSA9IG5ldyBEYXRlKGRhdHVtLnRpbWUpO1xuICAgIHJldHVybiBkYXR1bTtcbiAgfSk7XG5cbiAgYnVpbGRDaGFydChwYXJzZWREYXRhKTtcblxuICBmdW5jdGlvbiBidWlsZENoYXJ0KGRhdGEpIHtcbiAgICB2YXIgY3VycmVudFRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIHZhciB0aW1lTWluID0gbmV3IERhdGUoKTtcbiAgICB0aW1lTWluLnNldEhvdXJzKGN1cnJlbnRUaW1lLmdldEhvdXJzKCkgLSAxKTtcblxuICAgIHguZG9tYWluKFt0aW1lTWluLCBjdXJyZW50VGltZV0pO1xuXG4gICAgdmFyIHByaWNlRXh0ZW50ID0gZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBkLmxhc3RQcmljZTtcbiAgICB9KTtcblxuICAgIHkuZG9tYWluKFtwcmljZUV4dGVudFswXSAtIDI1LCBwcmljZUV4dGVudFswXSArIDI1XSk7XG4gICAgem9vbS54KHgpO1xuXG4gICAgc3ZnLmFwcGVuZCgnZycpXG4gICAgICAuYXR0cignY2xhc3MnLCAneCBheGlzJylcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDAsJyArIGhlaWdodCArICcpJyk7XG5cbiAgICBzdmcuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICd5IGF4aXMnKVxuICAgICAgLmFwcGVuZCgndGV4dCcpXG4gICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3JvdGF0ZSgtOTApJylcbiAgICAgIC5hdHRyKCd5JywgNilcbiAgICAgIC5hdHRyKCdkeScsICcuNzFlbScpXG4gICAgICAuc3R5bGUoJ3RleHQtYW5jaG9yJywgJ2VuZCcpXG4gICAgICAudGV4dCgnTGFzdCBQcmljZSAoJCknKTtcblxuICAgIHN2Zy5zZWxlY3RBbGwoJy5kb3QnKVxuICAgICAgLmRhdGEoZGF0YSlcbiAgICAgIC5lbnRlcigpLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdkb3QnKVxuICAgICAgLmF0dHIoJ3InLCAzLjUpXG4gICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiB4KGQudGltZSk7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4geShkLmxhc3RQcmljZSk7XG4gICAgICB9KTtcblxuICAgIHN2Zy5hcHBlbmQoXCJwYXRoXCIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibGluZVwiKVxuXG4gICAgc3ZnLnNlbGVjdChcInBhdGgubGluZVwiKS5kYXRhKFtkYXRhXSk7XG5cblxuICAgIGRyYXcoKTtcblxuICB9XG5cbiAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICBzdmcuc2VsZWN0KFwiZy54LmF4aXNcIikuY2FsbCh4QXhpcyk7XG4gICAgc3ZnLnNlbGVjdChcImcueS5heGlzXCIpLmNhbGwoeUF4aXMpO1xuICAgIHN2Zy5zZWxlY3QoXCJwYXRoLmxpbmVcIikuYXR0cihcImRcIiwgbGluZSk7XG5cbiAgICBzdmcuc2VsZWN0QWxsKCcuZG90JylcbiAgICAuYXR0cignY2xhc3MnLCAnZG90JylcbiAgICAuYXR0cigncicsIDMuNSlcbiAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4geChkLnRpbWUpO1xuICAgIH0pXG4gICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIHkoZC5sYXN0UHJpY2UpO1xuICAgIH0pO1xuICB9XG5cbiAgXG59OyJdfQ==
