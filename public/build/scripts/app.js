(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
require('./crossfilter.js')();
},{"./crossfilter.js":2}],2:[function(require,module,exports){
var dc = require('dc');

module.exports = function() {
  //prep data for dc/crossfilter
  var parsedPrices = JSON.parse(prices);
  var data = parsedPrices.map(function(price, index) {
    price.time = new Date(price.time);
    return price;
  });

  var bitstampData = crossfilter(data);
  var all = bitstampData.groupAll();

  var dateDimension = bitstampData.dimension(function(d) {
    return d.time;
  });

  var priceGroup = dateDimension.group().reduceSum(function(d) {
    return d.lastPrice
  })

  //dc line chart
  var lineChart = dc.lineChart('#chart-container');

  var timeExtent = d3.extent(data, function(d) {
    return d.time;
  });

  var priceExtent = d3.extent(data, function(d) {
    return d.lastPrice;
  })

  lineChart
    .width(700)
    .height(150)
    .margins({top: 10, right: 10, bottom: 20, left: 60})
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .x(d3.time.scale().domain(timeExtent))
    .y(d3.scale.linear().domain(priceExtent))
    .dimension(dateDimension)
    .group(priceGroup);

  //dc snippet chart
  var snippetChart = dc.lineChart('#snippet-container');

  snippetChart
    .width(700)
    .height(400)
    .margins({top: 10, right: 10, bottom: 20, left: 60})
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .brushOn(false)
    .x(d3.time.scale().domain(timeExtent))
    .y(d3.scale.linear().domain(priceExtent))
    .dimension(dateDimension)
    .group(priceGroup);


  lineChart.on('filtered', function(chart, filter) {
    if(!filter)
      return;
    
    var timeMin = filter[0];
    var timeMax = filter[1];
    snippetChart.x(d3.time.scale().domain([timeMin, timeMax]));
    snippetChart.redraw();      
  })




  //dc data table
  var dataTable = dc.dataTable('#dc-data-table');

  dataTable.width(960).height(800)
    .dimension(dateDimension)
    .group(function(d) {
      return "Price Table"
    })
    .size(25)
    .columns([
      function(d) {return d.time},
      function(d) {return d.lastPrice}
    ]);

  dc.renderAll();




}
},{"dc":"dc"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9jcm9zc2ZpbHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyByZXF1aXJlKCcuL2NoYXJ0LmpzJykoKTtcbnJlcXVpcmUoJy4vY3Jvc3NmaWx0ZXIuanMnKSgpOyIsInZhciBkYyA9IHJlcXVpcmUoJ2RjJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIC8vcHJlcCBkYXRhIGZvciBkYy9jcm9zc2ZpbHRlclxuICB2YXIgcGFyc2VkUHJpY2VzID0gSlNPTi5wYXJzZShwcmljZXMpO1xuICB2YXIgZGF0YSA9IHBhcnNlZFByaWNlcy5tYXAoZnVuY3Rpb24ocHJpY2UsIGluZGV4KSB7XG4gICAgcHJpY2UudGltZSA9IG5ldyBEYXRlKHByaWNlLnRpbWUpO1xuICAgIHJldHVybiBwcmljZTtcbiAgfSk7XG5cbiAgdmFyIGJpdHN0YW1wRGF0YSA9IGNyb3NzZmlsdGVyKGRhdGEpO1xuICB2YXIgYWxsID0gYml0c3RhbXBEYXRhLmdyb3VwQWxsKCk7XG5cbiAgdmFyIGRhdGVEaW1lbnNpb24gPSBiaXRzdGFtcERhdGEuZGltZW5zaW9uKGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC50aW1lO1xuICB9KTtcblxuICB2YXIgcHJpY2VHcm91cCA9IGRhdGVEaW1lbnNpb24uZ3JvdXAoKS5yZWR1Y2VTdW0oZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmxhc3RQcmljZVxuICB9KVxuXG4gIC8vZGMgbGluZSBjaGFydFxuICB2YXIgbGluZUNoYXJ0ID0gZGMubGluZUNoYXJ0KCcjY2hhcnQtY29udGFpbmVyJyk7XG5cbiAgdmFyIHRpbWVFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLnRpbWU7XG4gIH0pO1xuXG4gIHZhciBwcmljZUV4dGVudCA9IGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQubGFzdFByaWNlO1xuICB9KVxuXG4gIGxpbmVDaGFydFxuICAgIC53aWR0aCg3MDApXG4gICAgLmhlaWdodCgxNTApXG4gICAgLm1hcmdpbnMoe3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogNjB9KVxuICAgIC5yZW5kZXJIb3Jpem9udGFsR3JpZExpbmVzKHRydWUpXG4gICAgLnJlbmRlclZlcnRpY2FsR3JpZExpbmVzKHRydWUpXG4gICAgLngoZDMudGltZS5zY2FsZSgpLmRvbWFpbih0aW1lRXh0ZW50KSlcbiAgICAueShkMy5zY2FsZS5saW5lYXIoKS5kb21haW4ocHJpY2VFeHRlbnQpKVxuICAgIC5kaW1lbnNpb24oZGF0ZURpbWVuc2lvbilcbiAgICAuZ3JvdXAocHJpY2VHcm91cCk7XG5cbiAgLy9kYyBzbmlwcGV0IGNoYXJ0XG4gIHZhciBzbmlwcGV0Q2hhcnQgPSBkYy5saW5lQ2hhcnQoJyNzbmlwcGV0LWNvbnRhaW5lcicpO1xuXG4gIHNuaXBwZXRDaGFydFxuICAgIC53aWR0aCg3MDApXG4gICAgLmhlaWdodCg0MDApXG4gICAgLm1hcmdpbnMoe3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogNjB9KVxuICAgIC5yZW5kZXJIb3Jpem9udGFsR3JpZExpbmVzKHRydWUpXG4gICAgLnJlbmRlclZlcnRpY2FsR3JpZExpbmVzKHRydWUpXG4gICAgLmJydXNoT24oZmFsc2UpXG4gICAgLngoZDMudGltZS5zY2FsZSgpLmRvbWFpbih0aW1lRXh0ZW50KSlcbiAgICAueShkMy5zY2FsZS5saW5lYXIoKS5kb21haW4ocHJpY2VFeHRlbnQpKVxuICAgIC5kaW1lbnNpb24oZGF0ZURpbWVuc2lvbilcbiAgICAuZ3JvdXAocHJpY2VHcm91cCk7XG5cblxuICBsaW5lQ2hhcnQub24oJ2ZpbHRlcmVkJywgZnVuY3Rpb24oY2hhcnQsIGZpbHRlcikge1xuICAgIGlmKCFmaWx0ZXIpXG4gICAgICByZXR1cm47XG4gICAgXG4gICAgdmFyIHRpbWVNaW4gPSBmaWx0ZXJbMF07XG4gICAgdmFyIHRpbWVNYXggPSBmaWx0ZXJbMV07XG4gICAgc25pcHBldENoYXJ0LngoZDMudGltZS5zY2FsZSgpLmRvbWFpbihbdGltZU1pbiwgdGltZU1heF0pKTtcbiAgICBzbmlwcGV0Q2hhcnQucmVkcmF3KCk7ICAgICAgXG4gIH0pXG5cblxuXG5cbiAgLy9kYyBkYXRhIHRhYmxlXG4gIHZhciBkYXRhVGFibGUgPSBkYy5kYXRhVGFibGUoJyNkYy1kYXRhLXRhYmxlJyk7XG5cbiAgZGF0YVRhYmxlLndpZHRoKDk2MCkuaGVpZ2h0KDgwMClcbiAgICAuZGltZW5zaW9uKGRhdGVEaW1lbnNpb24pXG4gICAgLmdyb3VwKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBcIlByaWNlIFRhYmxlXCJcbiAgICB9KVxuICAgIC5zaXplKDI1KVxuICAgIC5jb2x1bW5zKFtcbiAgICAgIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC50aW1lfSxcbiAgICAgIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC5sYXN0UHJpY2V9XG4gICAgXSk7XG5cbiAgZGMucmVuZGVyQWxsKCk7XG5cblxuXG5cbn0iXX0=
