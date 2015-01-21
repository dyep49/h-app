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
},{"d3":"d3"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9jaGFydC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoJy4vY2hhcnQuanMnKSgpOyIsInZhciBkMyA9IHJlcXVpcmUoJ2QzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgbWFyZ2luID0ge3RvcDogMjAsIHJpZ2h0OiAyMCwgYm90dG9tOiAzMCwgbGVmdDogMTAwfTtcbiAgdmFyIHdpZHRoID0gOTYwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XG4gIHZhciBoZWlnaHQgPSA1MDAgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcblxuICB2YXIgeCA9IGQzLnRpbWUuc2NhbGUoKVxuICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcblxuICB2YXIgeSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgLnJhbmdlKFtoZWlnaHQsIDBdKTtcblxuICB2YXIgeEF4aXMgPSBkMy5zdmcuYXhpcygpXG4gICAgLnNjYWxlKHgpXG4gICAgLm9yaWVudCgnYm90dG9tJyk7XG5cbiAgdmFyIHlBeGlzID0gZDMuc3ZnLmF4aXMoKVxuICAgIC5zY2FsZSh5KVxuICAgIC5vcmllbnQoJ2xlZnQnKTtcblxuICB2YXIgc3ZnID0gZDMuc2VsZWN0KCdib2R5JykuYXBwZW5kKCdzdmcnKVxuICAgIC5hdHRyKCd3aWR0aCcsIHdpZHRoICsgbWFyZ2luLmxlZnQgKyBtYXJnaW4ucmlnaHQpXG4gICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxuICAgIC5hcHBlbmQoJ2cnKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgbWFyZ2luLmxlZnQgKyBcIixcIiArIG1hcmdpbi50b3AgKyBcIilcIilcblxuICB2YXIgem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgIC5vbihcInpvb21cIiwgZHJhdyk7XG5cbiAgc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAuYXR0cihcImNsYXNzXCIsIFwicGFuZVwiKVxuICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGgpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0KVxuICAgIC5jYWxsKHpvb20pO1xuXG4gIGQzLmpzb24oJy9wcmljZXMnLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcbiAgICB2YXIgcGFyc2VkRGF0YSA9IGRhdGEucHJpY2VzLm1hcChmdW5jdGlvbihkYXR1bSkge1xuICAgICAgZGF0dW0udGltZSA9IG5ldyBEYXRlKGRhdHVtLnRpbWUpO1xuICAgICAgcmV0dXJuIGRhdHVtO1xuICAgIH0pO1xuXG4gICAgYnVpbGRDaGFydChwYXJzZWREYXRhKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gYnVpbGRDaGFydChkYXRhKSB7XG4gICAgdmFyIHNhbXBsZSA9IGRhdGEucmV2ZXJzZSgpLnNsaWNlKDAsIDIwKVxuXG4gICAgdmFyIHRpbWVFeHRlbnQgPSBkMy5leHRlbnQoc2FtcGxlLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoZC50aW1lKTtcbiAgICB9KTtcblxuICAgIHZhciBwcmljZUV4dGVudCA9IGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gZC5sYXN0UHJpY2U7XG4gICAgfSk7XG5cbiAgICB4LmRvbWFpbih0aW1lRXh0ZW50KTtcbiAgICB5LmRvbWFpbihbcHJpY2VFeHRlbnRbMF0gLSAyNSwgcHJpY2VFeHRlbnRbMF0gKyAyNV0pO1xuICAgIHpvb20ueCh4KTtcblxuICAgIHN2Zy5hcHBlbmQoJ2cnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ3ggYXhpcycpXG4gICAgICAuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgwLCcgKyBoZWlnaHQgKyAnKScpXG4gICAgICAuY2FsbCh4QXhpcyk7XG5cbiAgICBzdmcuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICd5IGF4aXMnKVxuICAgICAgLmNhbGwoeUF4aXMpXG4gICAgICAuYXBwZW5kKCd0ZXh0JylcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAncm90YXRlKC05MCknKVxuICAgICAgLmF0dHIoJ3knLCA2KVxuICAgICAgLmF0dHIoJ2R5JywgJy43MWVtJylcbiAgICAgIC5zdHlsZSgndGV4dC1hbmNob3InLCAnZW5kJylcbiAgICAgIC50ZXh0KCdMYXN0IFByaWNlICgkKScpO1xuXG4gICAgc3ZnLnNlbGVjdEFsbCgnLmRvdCcpXG4gICAgICAuZGF0YShkYXRhKVxuICAgICAgLmVudGVyKCkuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ2RvdCcpXG4gICAgICAuYXR0cigncicsIDMuNSlcbiAgICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIHgoZC50aW1lKTtcbiAgICAgIH0pXG4gICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiB5KGQubGFzdFByaWNlKTtcbiAgICAgIH0pO1xuXG5cbiAgICBkcmF3KCk7XG5cbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgc3ZnLnNlbGVjdChcImcueC5heGlzXCIpLmNhbGwoeEF4aXMpO1xuICAgIHN2Zy5zZWxlY3QoXCJnLnkuYXhpc1wiKS5jYWxsKHlBeGlzKTtcbiAgICAvLyBzdmcuc2VsZWN0KFwicGF0aC5hcmVhXCIpLmF0dHIoXCJkXCIsIGFyZWEpO1xuICAgIC8vIHN2Zy5zZWxlY3QoXCJwYXRoLmxpbmVcIikuYXR0cihcImRcIiwgbGluZSk7XG4gIH1cblxuICBcbn07Il19
