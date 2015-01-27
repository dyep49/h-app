(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
require('./charts.js')();
require('./websockets.js');
},{"./charts.js":2,"./websockets.js":5}],2:[function(require,module,exports){
var dc = require('dc');
var cf = require('./crossfilter.js');
var table = require('./table.js');
var socket = require('./websockets.js');

module.exports = function() {
  var mostRecent;
  var priceMin;
  var priceMax;

  //prep data for dc/crossfilter
  var bitstampData = cf.init(prices);
  var all = bitstampData.groupAll();

  var dateDimension = bitstampData.dimension(function(d) {
    return d.time;
  });

  //Most recent price object
  mostRecent = dateDimension.top(1)[0];

  var priceDimension = bitstampData.dimension(function(d) {
    return d.lastPrice;
  });

  var priceGroup = dateDimension.group().reduceSum(function(d) {
    return d.lastPrice
  })

  //dc data table
  table.init(dateDimension);

  //dc line chart
  var lineChart = dc.lineChart('#chart-container');

  var timeExtent = d3.extent(data, function(d) {
    return d.time;
  });

  var priceExtent = d3.extent(data, function(d) {
    return d.lastPrice;
  })

  priceMin = priceDimension.bottom(1)[0].lastPrice * .975;
  priceMax = priceDimension.top(1)[0].lastPrice * 1.025;

  lineChart
    .width(null)
    .height(150)
    .margins({top: 10, right: 10, bottom: 20, left: 60})
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .elasticX(true)
    .x(d3.time.scale().domain(timeExtent))
    .y(d3.scale.linear().domain([priceMin, priceMax]))
    .dimension(dateDimension)
    .group(priceGroup);

  //dc snippet chart
  var snippetChart = dc.lineChart('#snippet-container');

  snippetChart
    .width(null)
    .height(400)
    .margins({top: 10, right: 10, bottom: 20, left: 60})
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .brushOn(false)
    .x(d3.time.scale().domain(timeExtent))
    .y(d3.scale.linear().domain(priceExtent))
    .dimension(dateDimension)
    .group(priceGroup);

  //Snippet points tooltip
  snippetChart.title(function(d) { 
    return 'Time: ' + d.key + ' Price: ' + d.value;})

  lineChart.renderlet(function(chart) {
    // dc.events.trigger(function() {
      snippetChart.focus(chart.filter());
    // }, 100)
  })


  // lineChart.on('filtered', function(chart, filter) {
  //   if(!filter)
  //     return;

  //   var timeMin = filter[0];
  //   var timeMax = filter[1];
  //   snippetChart.x(d3.time.scale().domain([timeMin, timeMax]));
  //   snippetChart.redraw();      
  // })






  dc.renderAll();


  socket.on('price', function(price) {
    var newPrice = {}
    newPrice.time = new Date(price.time);
    newPrice.lastPrice = price.lastPrice;


    if(newPrice.time.toString() !== mostRecent.time.toString()) {
      console.log(newPrice);
      mostRecent = newPrice;

      bitstampData.add([newPrice]);

      if(newPrice.lastPrice * 1.025 > priceMax || newPrice.lastPrice < priceMin * .975) {
        updateYAxis(newPrice.lastPrice);
      }

      updateLineChart();

      dc.redrawAll();          
    }

  })

  function updateYAxis(price) {
    var newDomain = price * 1.025 > priceMax ? [priceMin, price * 1.025] : [price * .975, priceMax];

    priceMin = newDomain[0];
    priceMax = newDomain[1];

    lineChart.y(d3.scale.linear().domain([priceMin, priceMax]))
  }

  function updateLineChart() {
    //update time range 
    var updatedTimeExtent = d3.time.scale()
      .domain([timeExtent[0], Date.now()]);

    lineChart
      .x(updatedTimeExtent)
  }

}
},{"./crossfilter.js":3,"./table.js":4,"./websockets.js":5,"dc":"dc"}],3:[function(require,module,exports){
'use strict';

var dc = require('dc');

var helpers = {

  init: function(dataString) {
    var data = this.parseData(dataString);
    return crossfilter(data);
  },

  parseData: function(dataString) {
    var parsedPrices = JSON.parse(dataString);
    return parsedPrices.map(function(price) {
      price.time = new Date(price.time);
      return price;
    });
  }


}

module.exports = helpers;
},{"dc":"dc"}],4:[function(require,module,exports){
var dc = require('dc');

var dcDataTable = {

  init: function(dimension) {
    var dataTable = dc.dataTable('#dc-data-table');
    var parseTime = d3.time.format("%b %e %H:%M:%S")

    dataTable.width(960).height(800)
      .dimension(dimension)
      .group(function(d) {
        return ""
      })
      .size(20000)
      .columns([
        function(d) {return parseTime(d.time)},
        function(d) {return d.lastPrice}
      ])
      .sortBy(function(d) {
        return d.time
      })
      .order(d3.descending);

    return dataTable
  }
}

module.exports = dcDataTable;


},{"dc":"dc"}],5:[function(require,module,exports){
var io = require('socket.io-client');
var socket = io.connect('http://localhost:4000');

socket.on('connect', function() {
  console.log('connected to websockets');
});

module.exports = socket;



},{"socket.io-client":"socket.io-client"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvY3Jvc3NmaWx0ZXIuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvdGFibGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvd2Vic29ja2V0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyByZXF1aXJlKCcuL2NoYXJ0LmpzJykoKTtcbnJlcXVpcmUoJy4vY2hhcnRzLmpzJykoKTtcbnJlcXVpcmUoJy4vd2Vic29ja2V0cy5qcycpOyIsInZhciBkYyA9IHJlcXVpcmUoJ2RjJyk7XG52YXIgY2YgPSByZXF1aXJlKCcuL2Nyb3NzZmlsdGVyLmpzJyk7XG52YXIgdGFibGUgPSByZXF1aXJlKCcuL3RhYmxlLmpzJyk7XG52YXIgc29ja2V0ID0gcmVxdWlyZSgnLi93ZWJzb2NrZXRzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtb3N0UmVjZW50O1xuICB2YXIgcHJpY2VNaW47XG4gIHZhciBwcmljZU1heDtcblxuICAvL3ByZXAgZGF0YSBmb3IgZGMvY3Jvc3NmaWx0ZXJcbiAgdmFyIGJpdHN0YW1wRGF0YSA9IGNmLmluaXQocHJpY2VzKTtcbiAgdmFyIGFsbCA9IGJpdHN0YW1wRGF0YS5ncm91cEFsbCgpO1xuXG4gIHZhciBkYXRlRGltZW5zaW9uID0gYml0c3RhbXBEYXRhLmRpbWVuc2lvbihmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQudGltZTtcbiAgfSk7XG5cbiAgLy9Nb3N0IHJlY2VudCBwcmljZSBvYmplY3RcbiAgbW9zdFJlY2VudCA9IGRhdGVEaW1lbnNpb24udG9wKDEpWzBdO1xuXG4gIHZhciBwcmljZURpbWVuc2lvbiA9IGJpdHN0YW1wRGF0YS5kaW1lbnNpb24oZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmxhc3RQcmljZTtcbiAgfSk7XG5cbiAgdmFyIHByaWNlR3JvdXAgPSBkYXRlRGltZW5zaW9uLmdyb3VwKCkucmVkdWNlU3VtKGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5sYXN0UHJpY2VcbiAgfSlcblxuICAvL2RjIGRhdGEgdGFibGVcbiAgdGFibGUuaW5pdChkYXRlRGltZW5zaW9uKTtcblxuICAvL2RjIGxpbmUgY2hhcnRcbiAgdmFyIGxpbmVDaGFydCA9IGRjLmxpbmVDaGFydCgnI2NoYXJ0LWNvbnRhaW5lcicpO1xuXG4gIHZhciB0aW1lRXh0ZW50ID0gZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC50aW1lO1xuICB9KTtcblxuICB2YXIgcHJpY2VFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmxhc3RQcmljZTtcbiAgfSlcblxuICBwcmljZU1pbiA9IHByaWNlRGltZW5zaW9uLmJvdHRvbSgxKVswXS5sYXN0UHJpY2UgKiAuOTc1O1xuICBwcmljZU1heCA9IHByaWNlRGltZW5zaW9uLnRvcCgxKVswXS5sYXN0UHJpY2UgKiAxLjAyNTtcblxuICBsaW5lQ2hhcnRcbiAgICAud2lkdGgobnVsbClcbiAgICAuaGVpZ2h0KDE1MClcbiAgICAubWFyZ2lucyh7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDIwLCBsZWZ0OiA2MH0pXG4gICAgLnJlbmRlckhvcml6b250YWxHcmlkTGluZXModHJ1ZSlcbiAgICAucmVuZGVyVmVydGljYWxHcmlkTGluZXModHJ1ZSlcbiAgICAuZWxhc3RpY1godHJ1ZSlcbiAgICAueChkMy50aW1lLnNjYWxlKCkuZG9tYWluKHRpbWVFeHRlbnQpKVxuICAgIC55KGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbihbcHJpY2VNaW4sIHByaWNlTWF4XSkpXG4gICAgLmRpbWVuc2lvbihkYXRlRGltZW5zaW9uKVxuICAgIC5ncm91cChwcmljZUdyb3VwKTtcblxuICAvL2RjIHNuaXBwZXQgY2hhcnRcbiAgdmFyIHNuaXBwZXRDaGFydCA9IGRjLmxpbmVDaGFydCgnI3NuaXBwZXQtY29udGFpbmVyJyk7XG5cbiAgc25pcHBldENoYXJ0XG4gICAgLndpZHRoKG51bGwpXG4gICAgLmhlaWdodCg0MDApXG4gICAgLm1hcmdpbnMoe3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogNjB9KVxuICAgIC5yZW5kZXJIb3Jpem9udGFsR3JpZExpbmVzKHRydWUpXG4gICAgLnJlbmRlclZlcnRpY2FsR3JpZExpbmVzKHRydWUpXG4gICAgLmJydXNoT24oZmFsc2UpXG4gICAgLngoZDMudGltZS5zY2FsZSgpLmRvbWFpbih0aW1lRXh0ZW50KSlcbiAgICAueShkMy5zY2FsZS5saW5lYXIoKS5kb21haW4ocHJpY2VFeHRlbnQpKVxuICAgIC5kaW1lbnNpb24oZGF0ZURpbWVuc2lvbilcbiAgICAuZ3JvdXAocHJpY2VHcm91cCk7XG5cbiAgLy9TbmlwcGV0IHBvaW50cyB0b29sdGlwXG4gIHNuaXBwZXRDaGFydC50aXRsZShmdW5jdGlvbihkKSB7IFxuICAgIHJldHVybiAnVGltZTogJyArIGQua2V5ICsgJyBQcmljZTogJyArIGQudmFsdWU7fSlcblxuICBsaW5lQ2hhcnQucmVuZGVybGV0KGZ1bmN0aW9uKGNoYXJ0KSB7XG4gICAgLy8gZGMuZXZlbnRzLnRyaWdnZXIoZnVuY3Rpb24oKSB7XG4gICAgICBzbmlwcGV0Q2hhcnQuZm9jdXMoY2hhcnQuZmlsdGVyKCkpO1xuICAgIC8vIH0sIDEwMClcbiAgfSlcblxuXG4gIC8vIGxpbmVDaGFydC5vbignZmlsdGVyZWQnLCBmdW5jdGlvbihjaGFydCwgZmlsdGVyKSB7XG4gIC8vICAgaWYoIWZpbHRlcilcbiAgLy8gICAgIHJldHVybjtcblxuICAvLyAgIHZhciB0aW1lTWluID0gZmlsdGVyWzBdO1xuICAvLyAgIHZhciB0aW1lTWF4ID0gZmlsdGVyWzFdO1xuICAvLyAgIHNuaXBwZXRDaGFydC54KGQzLnRpbWUuc2NhbGUoKS5kb21haW4oW3RpbWVNaW4sIHRpbWVNYXhdKSk7XG4gIC8vICAgc25pcHBldENoYXJ0LnJlZHJhdygpOyAgICAgIFxuICAvLyB9KVxuXG5cblxuXG5cblxuICBkYy5yZW5kZXJBbGwoKTtcblxuXG4gIHNvY2tldC5vbigncHJpY2UnLCBmdW5jdGlvbihwcmljZSkge1xuICAgIHZhciBuZXdQcmljZSA9IHt9XG4gICAgbmV3UHJpY2UudGltZSA9IG5ldyBEYXRlKHByaWNlLnRpbWUpO1xuICAgIG5ld1ByaWNlLmxhc3RQcmljZSA9IHByaWNlLmxhc3RQcmljZTtcblxuXG4gICAgaWYobmV3UHJpY2UudGltZS50b1N0cmluZygpICE9PSBtb3N0UmVjZW50LnRpbWUudG9TdHJpbmcoKSkge1xuICAgICAgY29uc29sZS5sb2cobmV3UHJpY2UpO1xuICAgICAgbW9zdFJlY2VudCA9IG5ld1ByaWNlO1xuXG4gICAgICBiaXRzdGFtcERhdGEuYWRkKFtuZXdQcmljZV0pO1xuXG4gICAgICBpZihuZXdQcmljZS5sYXN0UHJpY2UgKiAxLjAyNSA+IHByaWNlTWF4IHx8IG5ld1ByaWNlLmxhc3RQcmljZSA8IHByaWNlTWluICogLjk3NSkge1xuICAgICAgICB1cGRhdGVZQXhpcyhuZXdQcmljZS5sYXN0UHJpY2UpO1xuICAgICAgfVxuXG4gICAgICB1cGRhdGVMaW5lQ2hhcnQoKTtcblxuICAgICAgZGMucmVkcmF3QWxsKCk7ICAgICAgICAgIFxuICAgIH1cblxuICB9KVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVlBeGlzKHByaWNlKSB7XG4gICAgdmFyIG5ld0RvbWFpbiA9IHByaWNlICogMS4wMjUgPiBwcmljZU1heCA/IFtwcmljZU1pbiwgcHJpY2UgKiAxLjAyNV0gOiBbcHJpY2UgKiAuOTc1LCBwcmljZU1heF07XG5cbiAgICBwcmljZU1pbiA9IG5ld0RvbWFpblswXTtcbiAgICBwcmljZU1heCA9IG5ld0RvbWFpblsxXTtcblxuICAgIGxpbmVDaGFydC55KGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbihbcHJpY2VNaW4sIHByaWNlTWF4XSkpXG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVMaW5lQ2hhcnQoKSB7XG4gICAgLy91cGRhdGUgdGltZSByYW5nZSBcbiAgICB2YXIgdXBkYXRlZFRpbWVFeHRlbnQgPSBkMy50aW1lLnNjYWxlKClcbiAgICAgIC5kb21haW4oW3RpbWVFeHRlbnRbMF0sIERhdGUubm93KCldKTtcblxuICAgIGxpbmVDaGFydFxuICAgICAgLngodXBkYXRlZFRpbWVFeHRlbnQpXG4gIH1cblxufSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRjID0gcmVxdWlyZSgnZGMnKTtcblxudmFyIGhlbHBlcnMgPSB7XG5cbiAgaW5pdDogZnVuY3Rpb24oZGF0YVN0cmluZykge1xuICAgIHZhciBkYXRhID0gdGhpcy5wYXJzZURhdGEoZGF0YVN0cmluZyk7XG4gICAgcmV0dXJuIGNyb3NzZmlsdGVyKGRhdGEpO1xuICB9LFxuXG4gIHBhcnNlRGF0YTogZnVuY3Rpb24oZGF0YVN0cmluZykge1xuICAgIHZhciBwYXJzZWRQcmljZXMgPSBKU09OLnBhcnNlKGRhdGFTdHJpbmcpO1xuICAgIHJldHVybiBwYXJzZWRQcmljZXMubWFwKGZ1bmN0aW9uKHByaWNlKSB7XG4gICAgICBwcmljZS50aW1lID0gbmV3IERhdGUocHJpY2UudGltZSk7XG4gICAgICByZXR1cm4gcHJpY2U7XG4gICAgfSk7XG4gIH1cblxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGVscGVyczsiLCJ2YXIgZGMgPSByZXF1aXJlKCdkYycpO1xuXG52YXIgZGNEYXRhVGFibGUgPSB7XG5cbiAgaW5pdDogZnVuY3Rpb24oZGltZW5zaW9uKSB7XG4gICAgdmFyIGRhdGFUYWJsZSA9IGRjLmRhdGFUYWJsZSgnI2RjLWRhdGEtdGFibGUnKTtcbiAgICB2YXIgcGFyc2VUaW1lID0gZDMudGltZS5mb3JtYXQoXCIlYiAlZSAlSDolTTolU1wiKVxuXG4gICAgZGF0YVRhYmxlLndpZHRoKDk2MCkuaGVpZ2h0KDgwMClcbiAgICAgIC5kaW1lbnNpb24oZGltZW5zaW9uKVxuICAgICAgLmdyb3VwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIFwiXCJcbiAgICAgIH0pXG4gICAgICAuc2l6ZSgyMDAwMClcbiAgICAgIC5jb2x1bW5zKFtcbiAgICAgICAgZnVuY3Rpb24oZCkge3JldHVybiBwYXJzZVRpbWUoZC50aW1lKX0sXG4gICAgICAgIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC5sYXN0UHJpY2V9XG4gICAgICBdKVxuICAgICAgLnNvcnRCeShmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBkLnRpbWVcbiAgICAgIH0pXG4gICAgICAub3JkZXIoZDMuZGVzY2VuZGluZyk7XG5cbiAgICByZXR1cm4gZGF0YVRhYmxlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkY0RhdGFUYWJsZTtcblxuIiwidmFyIGlvID0gcmVxdWlyZSgnc29ja2V0LmlvLWNsaWVudCcpO1xudmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuXG5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byB3ZWJzb2NrZXRzJyk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzb2NrZXQ7XG5cblxuIl19
