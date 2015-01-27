(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
// require('./charts.js')();
require('./websockets.js');

require('./d3-charts.js')();
},{"./d3-charts.js":2,"./websockets.js":3}],2:[function(require,module,exports){
//Adapted from http://bl.ocks.org/mbostock/1667367

var d3 = require('d3');

module.exports = function() {

  var margin = {top: 10, right: 10, bottom: 100, left: 40};
  var margin2 = {top: 430, right: 10, bottom: 20, left: 40};
  var width = 960 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
  var height2 = 500 - margin2.top - margin2.bottom;

  var parseDate = d3.time.format("%b %Y").parse;

  var x = d3.time.scale().range([0, width]),
      x2 = d3.time.scale().range([0, width]),
      y = d3.scale.linear().range([height, 0]),
      y2 = d3.scale.linear().range([height2, 0]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom"),
      xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
      yAxis = d3.svg.axis().scale(y).orient("left");

  var brush = d3.svg.brush()
      .x(x2)
      .on("brush", brushed);

  var line = d3.svg.line()
      .x(function(d) { return x(d.time); })
      .y(function(d) { return y(d.price); });

  var line2 = d3.svg.line()
      .x(function(d) { return x2(d.time); })
      .y(function(d) { return y2(d.price); });

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  var focus = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var context = svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  d3.json('/prices', function(err, data) {

    data = data.prices.map(function(d) {
      d.time = new Date(d.time);
      d.price = +d.lastPrice;
      return d;
    })

    var priceExtent = d3.extent(data, function(d) {
      return d.lastPrice;
    })

    var timeExtent = d3.extent(data, function(d) {
      return d.time;
    });

    console.log(priceExtent, timeExtent);

    x.domain(timeExtent);
    y.domain(priceExtent);
    x2.domain(x.domain());
    y2.domain(y.domain());

    focus.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);


    focus.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "y axis")
        .call(yAxis);


    focus.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('r', 3.5)
      .attr('cx', function(d) {
        return x(d.time);
      })
      .attr('cy', function(d) {
        return y(d.price);
      });


    context.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line2);

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "x brush")
        .call(brush)
      .selectAll("rect")
        .attr("y", -6)
        .attr("height", height2 + 7);
  })


  function brushed() {
    x.domain(brush.empty() ? x2.domain() : brush.extent());
    focus.select(".line").attr("d", line);
    focus.select(".x.axis").call(xAxis);

    focus.selectAll('.dot')
      .attr('cx', function(d) {
        return x(d.time);
      })
      .attr('cy', function(d) {
        return y(d.lastPrice);
      });
  }



}
},{"d3":"d3"}],3:[function(require,module,exports){
var io = require('socket.io-client');
var socket = io.connect('http://localhost:4000');

socket.on('connect', function() {
  console.log('connected to websockets');
});

module.exports = socket;



},{"socket.io-client":"socket.io-client"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9kMy1jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvd2Vic29ja2V0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHJlcXVpcmUoJy4vY2hhcnQuanMnKSgpO1xuLy8gcmVxdWlyZSgnLi9jaGFydHMuanMnKSgpO1xucmVxdWlyZSgnLi93ZWJzb2NrZXRzLmpzJyk7XG5cbnJlcXVpcmUoJy4vZDMtY2hhcnRzLmpzJykoKTsiLCIvL0FkYXB0ZWQgZnJvbSBodHRwOi8vYmwub2Nrcy5vcmcvbWJvc3RvY2svMTY2NzM2N1xuXG52YXIgZDMgPSByZXF1aXJlKCdkMycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuXG4gIHZhciBtYXJnaW4gPSB7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDEwMCwgbGVmdDogNDB9O1xuICB2YXIgbWFyZ2luMiA9IHt0b3A6IDQzMCwgcmlnaHQ6IDEwLCBib3R0b206IDIwLCBsZWZ0OiA0MH07XG4gIHZhciB3aWR0aCA9IDk2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xuICB2YXIgaGVpZ2h0ID0gNTAwIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XG4gIHZhciBoZWlnaHQyID0gNTAwIC0gbWFyZ2luMi50b3AgLSBtYXJnaW4yLmJvdHRvbTtcblxuICB2YXIgcGFyc2VEYXRlID0gZDMudGltZS5mb3JtYXQoXCIlYiAlWVwiKS5wYXJzZTtcblxuICB2YXIgeCA9IGQzLnRpbWUuc2NhbGUoKS5yYW5nZShbMCwgd2lkdGhdKSxcbiAgICAgIHgyID0gZDMudGltZS5zY2FsZSgpLnJhbmdlKFswLCB3aWR0aF0pLFxuICAgICAgeSA9IGQzLnNjYWxlLmxpbmVhcigpLnJhbmdlKFtoZWlnaHQsIDBdKSxcbiAgICAgIHkyID0gZDMuc2NhbGUubGluZWFyKCkucmFuZ2UoW2hlaWdodDIsIDBdKTtcblxuICB2YXIgeEF4aXMgPSBkMy5zdmcuYXhpcygpLnNjYWxlKHgpLm9yaWVudChcImJvdHRvbVwiKSxcbiAgICAgIHhBeGlzMiA9IGQzLnN2Zy5heGlzKCkuc2NhbGUoeDIpLm9yaWVudChcImJvdHRvbVwiKSxcbiAgICAgIHlBeGlzID0gZDMuc3ZnLmF4aXMoKS5zY2FsZSh5KS5vcmllbnQoXCJsZWZ0XCIpO1xuXG4gIHZhciBicnVzaCA9IGQzLnN2Zy5icnVzaCgpXG4gICAgICAueCh4MilcbiAgICAgIC5vbihcImJydXNoXCIsIGJydXNoZWQpO1xuXG4gIHZhciBsaW5lID0gZDMuc3ZnLmxpbmUoKVxuICAgICAgLngoZnVuY3Rpb24oZCkgeyByZXR1cm4geChkLnRpbWUpOyB9KVxuICAgICAgLnkoZnVuY3Rpb24oZCkgeyByZXR1cm4geShkLnByaWNlKTsgfSk7XG5cbiAgdmFyIGxpbmUyID0gZDMuc3ZnLmxpbmUoKVxuICAgICAgLngoZnVuY3Rpb24oZCkgeyByZXR1cm4geDIoZC50aW1lKTsgfSlcbiAgICAgIC55KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIHkyKGQucHJpY2UpOyB9KTtcblxuICB2YXIgc3ZnID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoXCJzdmdcIilcbiAgICAgIC5hdHRyKFwid2lkdGhcIiwgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKTtcblxuICBzdmcuYXBwZW5kKFwiZGVmc1wiKS5hcHBlbmQoXCJjbGlwUGF0aFwiKVxuICAgICAgLmF0dHIoXCJpZFwiLCBcImNsaXBcIilcbiAgICAuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aClcbiAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGhlaWdodCk7XG5cbiAgdmFyIGZvY3VzID0gc3ZnLmFwcGVuZChcImdcIilcbiAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJmb2N1c1wiKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4ubGVmdCArIFwiLFwiICsgbWFyZ2luLnRvcCArIFwiKVwiKTtcblxuICB2YXIgY29udGV4dCA9IHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwiY29udGV4dFwiKVxuICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyBtYXJnaW4yLmxlZnQgKyBcIixcIiArIG1hcmdpbjIudG9wICsgXCIpXCIpO1xuXG4gIGQzLmpzb24oJy9wcmljZXMnLCBmdW5jdGlvbihlcnIsIGRhdGEpIHtcblxuICAgIGRhdGEgPSBkYXRhLnByaWNlcy5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgZC50aW1lID0gbmV3IERhdGUoZC50aW1lKTtcbiAgICAgIGQucHJpY2UgPSArZC5sYXN0UHJpY2U7XG4gICAgICByZXR1cm4gZDtcbiAgICB9KVxuXG4gICAgdmFyIHByaWNlRXh0ZW50ID0gZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBkLmxhc3RQcmljZTtcbiAgICB9KVxuXG4gICAgdmFyIHRpbWVFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIGQudGltZTtcbiAgICB9KTtcblxuICAgIGNvbnNvbGUubG9nKHByaWNlRXh0ZW50LCB0aW1lRXh0ZW50KTtcblxuICAgIHguZG9tYWluKHRpbWVFeHRlbnQpO1xuICAgIHkuZG9tYWluKHByaWNlRXh0ZW50KTtcbiAgICB4Mi5kb21haW4oeC5kb21haW4oKSk7XG4gICAgeTIuZG9tYWluKHkuZG9tYWluKCkpO1xuXG4gICAgZm9jdXMuYXBwZW5kKFwicGF0aFwiKVxuICAgICAgICAuZGF0dW0oZGF0YSlcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxpbmVcIilcbiAgICAgICAgLmF0dHIoXCJkXCIsIGxpbmUpO1xuXG5cbiAgICBmb2N1cy5hcHBlbmQoXCJnXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGF4aXNcIilcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoMCxcIiArIGhlaWdodCArIFwiKVwiKVxuICAgICAgICAuY2FsbCh4QXhpcyk7XG5cbiAgICBmb2N1cy5hcHBlbmQoXCJnXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ5IGF4aXNcIilcbiAgICAgICAgLmNhbGwoeUF4aXMpO1xuXG5cbiAgICBmb2N1cy5zZWxlY3RBbGwoJy5kb3QnKVxuICAgICAgLmRhdGEoZGF0YSlcbiAgICAgIC5lbnRlcigpLmFwcGVuZCgnY2lyY2xlJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdkb3QnKVxuICAgICAgLmF0dHIoJ3InLCAzLjUpXG4gICAgICAuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiB4KGQudGltZSk7XG4gICAgICB9KVxuICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4geShkLnByaWNlKTtcbiAgICAgIH0pO1xuXG5cbiAgICBjb250ZXh0LmFwcGVuZChcInBhdGhcIilcbiAgICAgICAgLmRhdHVtKGRhdGEpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsaW5lXCIpXG4gICAgICAgIC5hdHRyKFwiZFwiLCBsaW5lMik7XG5cbiAgICBjb250ZXh0LmFwcGVuZChcImdcIilcbiAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInggYXhpc1wiKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgaGVpZ2h0MiArIFwiKVwiKVxuICAgICAgICAuY2FsbCh4QXhpczIpO1xuXG4gICAgY29udGV4dC5hcHBlbmQoXCJnXCIpXG4gICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ4IGJydXNoXCIpXG4gICAgICAgIC5jYWxsKGJydXNoKVxuICAgICAgLnNlbGVjdEFsbChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJ5XCIsIC02KVxuICAgICAgICAuYXR0cihcImhlaWdodFwiLCBoZWlnaHQyICsgNyk7XG4gIH0pXG5cblxuICBmdW5jdGlvbiBicnVzaGVkKCkge1xuICAgIHguZG9tYWluKGJydXNoLmVtcHR5KCkgPyB4Mi5kb21haW4oKSA6IGJydXNoLmV4dGVudCgpKTtcbiAgICBmb2N1cy5zZWxlY3QoXCIubGluZVwiKS5hdHRyKFwiZFwiLCBsaW5lKTtcbiAgICBmb2N1cy5zZWxlY3QoXCIueC5heGlzXCIpLmNhbGwoeEF4aXMpO1xuXG4gICAgZm9jdXMuc2VsZWN0QWxsKCcuZG90JylcbiAgICAgIC5hdHRyKCdjeCcsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIHgoZC50aW1lKTtcbiAgICAgIH0pXG4gICAgICAuYXR0cignY3knLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiB5KGQubGFzdFByaWNlKTtcbiAgICAgIH0pO1xuICB9XG5cblxuXG59IiwidmFyIGlvID0gcmVxdWlyZSgnc29ja2V0LmlvLWNsaWVudCcpO1xudmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuXG5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byB3ZWJzb2NrZXRzJyk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzb2NrZXQ7XG5cblxuIl19
