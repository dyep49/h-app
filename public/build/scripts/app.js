(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
require('./charts.js')();
require('./websockets.js');
},{"./charts.js":2,"./websockets.js":4}],2:[function(require,module,exports){
var dc = require('dc');
var cf = require('./crossfilter.js');
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

  mostRecent = dateDimension.top(1)[0];

  var priceDimension = bitstampData.dimension(function(d) {
    return d.lastPrice;
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




  //dc data table
  var dataTable = dc.dataTable('#dc-data-table');
  var parseTime = d3.time.format("%b %e %H:%M:%S")

  dataTable.width(960).height(800)
    .dimension(dateDimension)
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
},{"./crossfilter.js":3,"./websockets.js":4,"dc":"dc"}],3:[function(require,module,exports){
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
var io = require('socket.io-client');
var socket = io.connect('http://localhost:4000');

socket.on('connect', function() {
  console.log('connected to websockets');
});

module.exports = socket;



},{"socket.io-client":"socket.io-client"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9jaGFydHMuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvY3Jvc3NmaWx0ZXIuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvd2Vic29ja2V0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gcmVxdWlyZSgnLi9jaGFydC5qcycpKCk7XG5yZXF1aXJlKCcuL2NoYXJ0cy5qcycpKCk7XG5yZXF1aXJlKCcuL3dlYnNvY2tldHMuanMnKTsiLCJ2YXIgZGMgPSByZXF1aXJlKCdkYycpO1xudmFyIGNmID0gcmVxdWlyZSgnLi9jcm9zc2ZpbHRlci5qcycpO1xudmFyIHNvY2tldCA9IHJlcXVpcmUoJy4vd2Vic29ja2V0cy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbW9zdFJlY2VudDtcbiAgdmFyIHByaWNlTWluO1xuICB2YXIgcHJpY2VNYXg7XG5cbiAgLy9wcmVwIGRhdGEgZm9yIGRjL2Nyb3NzZmlsdGVyXG4gIHZhciBiaXRzdGFtcERhdGEgPSBjZi5pbml0KHByaWNlcyk7XG4gIHZhciBhbGwgPSBiaXRzdGFtcERhdGEuZ3JvdXBBbGwoKTtcblxuICB2YXIgZGF0ZURpbWVuc2lvbiA9IGJpdHN0YW1wRGF0YS5kaW1lbnNpb24oZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLnRpbWU7XG4gIH0pO1xuXG4gIG1vc3RSZWNlbnQgPSBkYXRlRGltZW5zaW9uLnRvcCgxKVswXTtcblxuICB2YXIgcHJpY2VEaW1lbnNpb24gPSBiaXRzdGFtcERhdGEuZGltZW5zaW9uKGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5sYXN0UHJpY2U7XG4gIH0pO1xuICBcbiAgdmFyIHByaWNlR3JvdXAgPSBkYXRlRGltZW5zaW9uLmdyb3VwKCkucmVkdWNlU3VtKGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5sYXN0UHJpY2VcbiAgfSlcblxuICAvL2RjIGxpbmUgY2hhcnRcbiAgdmFyIGxpbmVDaGFydCA9IGRjLmxpbmVDaGFydCgnI2NoYXJ0LWNvbnRhaW5lcicpO1xuXG4gIHZhciB0aW1lRXh0ZW50ID0gZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC50aW1lO1xuICB9KTtcblxuICB2YXIgcHJpY2VFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmxhc3RQcmljZTtcbiAgfSlcblxuICBwcmljZU1pbiA9IHByaWNlRGltZW5zaW9uLmJvdHRvbSgxKVswXS5sYXN0UHJpY2UgKiAuOTc1O1xuICBwcmljZU1heCA9IHByaWNlRGltZW5zaW9uLnRvcCgxKVswXS5sYXN0UHJpY2UgKiAxLjAyNTtcblxuICBsaW5lQ2hhcnRcbiAgICAud2lkdGgobnVsbClcbiAgICAuaGVpZ2h0KDE1MClcbiAgICAubWFyZ2lucyh7dG9wOiAxMCwgcmlnaHQ6IDEwLCBib3R0b206IDIwLCBsZWZ0OiA2MH0pXG4gICAgLnJlbmRlckhvcml6b250YWxHcmlkTGluZXModHJ1ZSlcbiAgICAucmVuZGVyVmVydGljYWxHcmlkTGluZXModHJ1ZSlcbiAgICAuZWxhc3RpY1godHJ1ZSlcbiAgICAueChkMy50aW1lLnNjYWxlKCkuZG9tYWluKHRpbWVFeHRlbnQpKVxuICAgIC55KGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbihbcHJpY2VNaW4sIHByaWNlTWF4XSkpXG4gICAgLmRpbWVuc2lvbihkYXRlRGltZW5zaW9uKVxuICAgIC5ncm91cChwcmljZUdyb3VwKTtcblxuICAvL2RjIHNuaXBwZXQgY2hhcnRcbiAgdmFyIHNuaXBwZXRDaGFydCA9IGRjLmxpbmVDaGFydCgnI3NuaXBwZXQtY29udGFpbmVyJyk7XG5cbiAgc25pcHBldENoYXJ0XG4gICAgLndpZHRoKG51bGwpXG4gICAgLmhlaWdodCg0MDApXG4gICAgLm1hcmdpbnMoe3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogNjB9KVxuICAgIC5yZW5kZXJIb3Jpem9udGFsR3JpZExpbmVzKHRydWUpXG4gICAgLnJlbmRlclZlcnRpY2FsR3JpZExpbmVzKHRydWUpXG4gICAgLmJydXNoT24oZmFsc2UpXG4gICAgLngoZDMudGltZS5zY2FsZSgpLmRvbWFpbih0aW1lRXh0ZW50KSlcbiAgICAueShkMy5zY2FsZS5saW5lYXIoKS5kb21haW4ocHJpY2VFeHRlbnQpKVxuICAgIC5kaW1lbnNpb24oZGF0ZURpbWVuc2lvbilcbiAgICAuZ3JvdXAocHJpY2VHcm91cCk7XG5cbiAgLy9TbmlwcGV0IHBvaW50cyB0b29sdGlwXG4gIHNuaXBwZXRDaGFydC50aXRsZShmdW5jdGlvbihkKSB7IFxuICAgIHJldHVybiAnVGltZTogJyArIGQua2V5ICsgJyBQcmljZTogJyArIGQudmFsdWU7fSlcblxuICBsaW5lQ2hhcnQucmVuZGVybGV0KGZ1bmN0aW9uKGNoYXJ0KSB7XG4gICAgLy8gZGMuZXZlbnRzLnRyaWdnZXIoZnVuY3Rpb24oKSB7XG4gICAgICBzbmlwcGV0Q2hhcnQuZm9jdXMoY2hhcnQuZmlsdGVyKCkpO1xuICAgIC8vIH0sIDEwMClcbiAgfSlcblxuXG4gIC8vIGxpbmVDaGFydC5vbignZmlsdGVyZWQnLCBmdW5jdGlvbihjaGFydCwgZmlsdGVyKSB7XG4gIC8vICAgaWYoIWZpbHRlcilcbiAgLy8gICAgIHJldHVybjtcblxuICAvLyAgIHZhciB0aW1lTWluID0gZmlsdGVyWzBdO1xuICAvLyAgIHZhciB0aW1lTWF4ID0gZmlsdGVyWzFdO1xuICAvLyAgIHNuaXBwZXRDaGFydC54KGQzLnRpbWUuc2NhbGUoKS5kb21haW4oW3RpbWVNaW4sIHRpbWVNYXhdKSk7XG4gIC8vICAgc25pcHBldENoYXJ0LnJlZHJhdygpOyAgICAgIFxuICAvLyB9KVxuXG5cblxuXG4gIC8vZGMgZGF0YSB0YWJsZVxuICB2YXIgZGF0YVRhYmxlID0gZGMuZGF0YVRhYmxlKCcjZGMtZGF0YS10YWJsZScpO1xuICB2YXIgcGFyc2VUaW1lID0gZDMudGltZS5mb3JtYXQoXCIlYiAlZSAlSDolTTolU1wiKVxuXG4gIGRhdGFUYWJsZS53aWR0aCg5NjApLmhlaWdodCg4MDApXG4gICAgLmRpbWVuc2lvbihkYXRlRGltZW5zaW9uKVxuICAgIC5ncm91cChmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gXCJcIlxuICAgIH0pXG4gICAgLnNpemUoMjAwMDApXG4gICAgLmNvbHVtbnMoW1xuICAgICAgZnVuY3Rpb24oZCkge3JldHVybiBwYXJzZVRpbWUoZC50aW1lKX0sXG4gICAgICBmdW5jdGlvbihkKSB7cmV0dXJuIGQubGFzdFByaWNlfVxuICAgIF0pXG4gICAgLnNvcnRCeShmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gZC50aW1lXG4gICAgfSlcbiAgICAub3JkZXIoZDMuZGVzY2VuZGluZyk7XG5cbiAgZGMucmVuZGVyQWxsKCk7XG5cblxuICBzb2NrZXQub24oJ3ByaWNlJywgZnVuY3Rpb24ocHJpY2UpIHtcbiAgICB2YXIgbmV3UHJpY2UgPSB7fVxuICAgIG5ld1ByaWNlLnRpbWUgPSBuZXcgRGF0ZShwcmljZS50aW1lKTtcbiAgICBuZXdQcmljZS5sYXN0UHJpY2UgPSBwcmljZS5sYXN0UHJpY2U7XG5cblxuICAgIGlmKG5ld1ByaWNlLnRpbWUudG9TdHJpbmcoKSAhPT0gbW9zdFJlY2VudC50aW1lLnRvU3RyaW5nKCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKG5ld1ByaWNlKTtcbiAgICAgIG1vc3RSZWNlbnQgPSBuZXdQcmljZTtcblxuICAgICAgYml0c3RhbXBEYXRhLmFkZChbbmV3UHJpY2VdKTtcblxuICAgICAgaWYobmV3UHJpY2UubGFzdFByaWNlICogMS4wMjUgPiBwcmljZU1heCB8fCBuZXdQcmljZS5sYXN0UHJpY2UgPCBwcmljZU1pbiAqIC45NzUpIHtcbiAgICAgICAgdXBkYXRlWUF4aXMobmV3UHJpY2UubGFzdFByaWNlKTtcbiAgICAgIH1cblxuICAgICAgdXBkYXRlTGluZUNoYXJ0KCk7XG5cbiAgICAgIGRjLnJlZHJhd0FsbCgpOyAgICAgICAgICBcbiAgICB9XG5cbiAgfSlcblxuICBmdW5jdGlvbiB1cGRhdGVZQXhpcyhwcmljZSkge1xuICAgIHZhciBuZXdEb21haW4gPSBwcmljZSAqIDEuMDI1ID4gcHJpY2VNYXggPyBbcHJpY2VNaW4sIHByaWNlICogMS4wMjVdIDogW3ByaWNlICogLjk3NSwgcHJpY2VNYXhdO1xuXG4gICAgcHJpY2VNaW4gPSBuZXdEb21haW5bMF07XG4gICAgcHJpY2VNYXggPSBuZXdEb21haW5bMV07XG5cbiAgICBsaW5lQ2hhcnQueShkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oW3ByaWNlTWluLCBwcmljZU1heF0pKVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlTGluZUNoYXJ0KCkge1xuICAgIC8vdXBkYXRlIHRpbWUgcmFuZ2UgXG4gICAgdmFyIHVwZGF0ZWRUaW1lRXh0ZW50ID0gZDMudGltZS5zY2FsZSgpXG4gICAgICAuZG9tYWluKFt0aW1lRXh0ZW50WzBdLCBEYXRlLm5vdygpXSk7XG5cbiAgICBsaW5lQ2hhcnRcbiAgICAgIC54KHVwZGF0ZWRUaW1lRXh0ZW50KVxuICB9XG5cbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciBkYyA9IHJlcXVpcmUoJ2RjJyk7XG5cbnZhciBoZWxwZXJzID0ge1xuXG4gIGluaXQ6IGZ1bmN0aW9uKGRhdGFTdHJpbmcpIHtcbiAgICB2YXIgZGF0YSA9IHRoaXMucGFyc2VEYXRhKGRhdGFTdHJpbmcpO1xuICAgIHJldHVybiBjcm9zc2ZpbHRlcihkYXRhKTtcbiAgfSxcblxuICBwYXJzZURhdGE6IGZ1bmN0aW9uKGRhdGFTdHJpbmcpIHtcbiAgICB2YXIgcGFyc2VkUHJpY2VzID0gSlNPTi5wYXJzZShkYXRhU3RyaW5nKTtcbiAgICByZXR1cm4gcGFyc2VkUHJpY2VzLm1hcChmdW5jdGlvbihwcmljZSkge1xuICAgICAgcHJpY2UudGltZSA9IG5ldyBEYXRlKHByaWNlLnRpbWUpO1xuICAgICAgcmV0dXJuIHByaWNlO1xuICAgIH0pO1xuICB9XG5cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhlbHBlcnM7IiwidmFyIGlvID0gcmVxdWlyZSgnc29ja2V0LmlvLWNsaWVudCcpO1xudmFyIHNvY2tldCA9IGlvLmNvbm5lY3QoJ2h0dHA6Ly9sb2NhbGhvc3Q6NDAwMCcpO1xuXG5zb2NrZXQub24oJ2Nvbm5lY3QnLCBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byB3ZWJzb2NrZXRzJyk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzb2NrZXQ7XG5cblxuIl19
