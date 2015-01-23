(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
require('./crossfilter.js')();
},{"./crossfilter.js":2}],2:[function(require,module,exports){
var dc = require('dc');

module.exports = function() {
  //prep data for dc/crossfilter
  var data = JSON.parse(prices).map(function(price) {
    price.time = new Date(price.time);
    return price;
  });

  var bitstampData = crossfilter(data);
  var all = bitstampData.groupAll();

  var dateDimension = bitstampData.dimension(function(d) {
    return d.time;
  });

  var priceDimension = bitstampData.dimension(function(d) {
    return d.lastPrice;
  });

  var priceGroup = dateDimension.group().reduceSum(function(d) {
    console.log(d.lastPrice);
    return d.lastPrice
  })

  //dc line chart
  var lineChart = dc.lineChart('#chart-container');

  var timeExtent = d3.extent(data, function(d) {
    return d.time;
  });

  lineChart
    .width(700)
    .height(400)
    .margins({top: 10, right: 10, bottom: 20, left: 60})
    .elasticY(true)
    .renderDataPoints(true)    
    .x(d3.time.scale().domain(timeExtent))
    .dimension(dateDimension)
    .group(priceGroup)



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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9jcm9zc2ZpbHRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gcmVxdWlyZSgnLi9jaGFydC5qcycpKCk7XG5yZXF1aXJlKCcuL2Nyb3NzZmlsdGVyLmpzJykoKTsiLCJ2YXIgZGMgPSByZXF1aXJlKCdkYycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAvL3ByZXAgZGF0YSBmb3IgZGMvY3Jvc3NmaWx0ZXJcbiAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKHByaWNlcykubWFwKGZ1bmN0aW9uKHByaWNlKSB7XG4gICAgcHJpY2UudGltZSA9IG5ldyBEYXRlKHByaWNlLnRpbWUpO1xuICAgIHJldHVybiBwcmljZTtcbiAgfSk7XG5cbiAgdmFyIGJpdHN0YW1wRGF0YSA9IGNyb3NzZmlsdGVyKGRhdGEpO1xuICB2YXIgYWxsID0gYml0c3RhbXBEYXRhLmdyb3VwQWxsKCk7XG5cbiAgdmFyIGRhdGVEaW1lbnNpb24gPSBiaXRzdGFtcERhdGEuZGltZW5zaW9uKGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC50aW1lO1xuICB9KTtcblxuICB2YXIgcHJpY2VEaW1lbnNpb24gPSBiaXRzdGFtcERhdGEuZGltZW5zaW9uKGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5sYXN0UHJpY2U7XG4gIH0pO1xuXG4gIHZhciBwcmljZUdyb3VwID0gZGF0ZURpbWVuc2lvbi5ncm91cCgpLnJlZHVjZVN1bShmdW5jdGlvbihkKSB7XG4gICAgY29uc29sZS5sb2coZC5sYXN0UHJpY2UpO1xuICAgIHJldHVybiBkLmxhc3RQcmljZVxuICB9KVxuXG4gIC8vZGMgbGluZSBjaGFydFxuICB2YXIgbGluZUNoYXJ0ID0gZGMubGluZUNoYXJ0KCcjY2hhcnQtY29udGFpbmVyJyk7XG5cbiAgdmFyIHRpbWVFeHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLnRpbWU7XG4gIH0pO1xuXG4gIGxpbmVDaGFydFxuICAgIC53aWR0aCg3MDApXG4gICAgLmhlaWdodCg0MDApXG4gICAgLm1hcmdpbnMoe3RvcDogMTAsIHJpZ2h0OiAxMCwgYm90dG9tOiAyMCwgbGVmdDogNjB9KVxuICAgIC5lbGFzdGljWSh0cnVlKVxuICAgIC5yZW5kZXJEYXRhUG9pbnRzKHRydWUpICAgIFxuICAgIC54KGQzLnRpbWUuc2NhbGUoKS5kb21haW4odGltZUV4dGVudCkpXG4gICAgLmRpbWVuc2lvbihkYXRlRGltZW5zaW9uKVxuICAgIC5ncm91cChwcmljZUdyb3VwKVxuXG5cblxuICAvL2RjIGRhdGEgdGFibGVcbiAgdmFyIGRhdGFUYWJsZSA9IGRjLmRhdGFUYWJsZSgnI2RjLWRhdGEtdGFibGUnKTtcblxuICBkYXRhVGFibGUud2lkdGgoOTYwKS5oZWlnaHQoODAwKVxuICAgIC5kaW1lbnNpb24oZGF0ZURpbWVuc2lvbilcbiAgICAuZ3JvdXAoZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIFwiUHJpY2UgVGFibGVcIlxuICAgIH0pXG4gICAgLnNpemUoMjUpXG4gICAgLmNvbHVtbnMoW1xuICAgICAgZnVuY3Rpb24oZCkge3JldHVybiBkLnRpbWV9LFxuICAgICAgZnVuY3Rpb24oZCkge3JldHVybiBkLmxhc3RQcmljZX1cbiAgICBdKTtcblxuICBkYy5yZW5kZXJBbGwoKTtcblxuXG5cblxufSJdfQ==
