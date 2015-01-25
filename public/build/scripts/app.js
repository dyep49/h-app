(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// require('./chart.js')();
require('./crossfilter.js')();
require('./websockets.js')
},{"./crossfilter.js":2,"./websockets.js":3}],2:[function(require,module,exports){
var dc = require('dc');
var socket = require('./websockets.js');

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

  var priceMin = priceDimension.bottom(1)[0].lastPrice * .975;
  var priceMax = priceDimension.top(1)[0].lastPrice * 1.025;

  lineChart
    .width(700)
    .height(150)
    .margins({top: 10, right: 10, bottom: 20, left: 60})
    .renderHorizontalGridLines(true)
    .renderVerticalGridLines(true)
    .x(d3.time.scale().domain(timeExtent))
    .y(d3.scale.linear().domain([priceMin, priceMax]))
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
    ]);

  dc.renderAll();


  socket.on('price', function(price) {
    console.log('new price');
    var newPrice = {}
    newPrice.time = new Date(price.time);
    newPrice.lastPrice = price.lastPrice;


    if(newPrice.time.toString() !== dateDimension.top(1)[0].time.toString()) {

      bitstampData.add([newPrice]);
      updateLineChart();

      dc.redrawAll();          
    }

  })

  function updateLineChart() {

    //update price range with padding
    var updatedPriceMin = priceDimension.bottom(1)[0].lastPrice * .975;
    var updatedPriceMax = priceDimension.top(1)[0].lastPrice * 1.025;

    //update time range 
    var updatedTimeExtent = d3.time.scale()
      .domain([timeExtent[0], dateDimension.top(1)[0].time]);

    lineChart
      .x(updatedTimeExtent)
      .y(d3.scale.linear().domain([updatedPriceMin, updatedPriceMax]));


  }

}
},{"./websockets.js":3,"dc":"dc"}],3:[function(require,module,exports){
var io = require('socket.io-client');
var socket = io.connect('http://localhost:4000');

socket.on('connect', function() {
  console.log('connected to websockets');
});

module.exports = socket;



},{"socket.io-client":"socket.io-client"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvc3JjL3NjcmlwdHMvaG9tZS5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy9jcm9zc2ZpbHRlci5qcyIsInB1YmxpYy9zcmMvc2NyaXB0cy93ZWJzb2NrZXRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHJlcXVpcmUoJy4vY2hhcnQuanMnKSgpO1xucmVxdWlyZSgnLi9jcm9zc2ZpbHRlci5qcycpKCk7XG5yZXF1aXJlKCcuL3dlYnNvY2tldHMuanMnKSIsInZhciBkYyA9IHJlcXVpcmUoJ2RjJyk7XG52YXIgc29ja2V0ID0gcmVxdWlyZSgnLi93ZWJzb2NrZXRzLmpzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgLy9wcmVwIGRhdGEgZm9yIGRjL2Nyb3NzZmlsdGVyXG4gIHZhciBwYXJzZWRQcmljZXMgPSBKU09OLnBhcnNlKHByaWNlcyk7XG4gIHZhciBkYXRhID0gcGFyc2VkUHJpY2VzLm1hcChmdW5jdGlvbihwcmljZSwgaW5kZXgpIHtcbiAgICBwcmljZS50aW1lID0gbmV3IERhdGUocHJpY2UudGltZSk7XG4gICAgcmV0dXJuIHByaWNlO1xuICB9KTtcblxuICB2YXIgYml0c3RhbXBEYXRhID0gY3Jvc3NmaWx0ZXIoZGF0YSk7XG4gIHZhciBhbGwgPSBiaXRzdGFtcERhdGEuZ3JvdXBBbGwoKTtcblxuXG5cbiAgdmFyIGRhdGVEaW1lbnNpb24gPSBiaXRzdGFtcERhdGEuZGltZW5zaW9uKGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC50aW1lO1xuICB9KTtcblxuICB2YXIgcHJpY2VEaW1lbnNpb24gPSBiaXRzdGFtcERhdGEuZGltZW5zaW9uKGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5sYXN0UHJpY2U7XG4gIH0pO1xuXG4gIHZhciBwcmljZUdyb3VwID0gZGF0ZURpbWVuc2lvbi5ncm91cCgpLnJlZHVjZVN1bShmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQubGFzdFByaWNlXG4gIH0pXG5cbiAgLy9kYyBsaW5lIGNoYXJ0XG4gIHZhciBsaW5lQ2hhcnQgPSBkYy5saW5lQ2hhcnQoJyNjaGFydC1jb250YWluZXInKTtcblxuICB2YXIgdGltZUV4dGVudCA9IGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQudGltZTtcbiAgfSk7XG5cbiAgdmFyIHByaWNlRXh0ZW50ID0gZDMuZXh0ZW50KGRhdGEsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5sYXN0UHJpY2U7XG4gIH0pXG5cbiAgdmFyIHByaWNlTWluID0gcHJpY2VEaW1lbnNpb24uYm90dG9tKDEpWzBdLmxhc3RQcmljZSAqIC45NzU7XG4gIHZhciBwcmljZU1heCA9IHByaWNlRGltZW5zaW9uLnRvcCgxKVswXS5sYXN0UHJpY2UgKiAxLjAyNTtcblxuICBsaW5lQ2hhcnRcbiAgICAud2lkdGgoNzAwKVxuICAgIC5oZWlnaHQoMTUwKVxuICAgIC5tYXJnaW5zKHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMjAsIGxlZnQ6IDYwfSlcbiAgICAucmVuZGVySG9yaXpvbnRhbEdyaWRMaW5lcyh0cnVlKVxuICAgIC5yZW5kZXJWZXJ0aWNhbEdyaWRMaW5lcyh0cnVlKVxuICAgIC54KGQzLnRpbWUuc2NhbGUoKS5kb21haW4odGltZUV4dGVudCkpXG4gICAgLnkoZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKFtwcmljZU1pbiwgcHJpY2VNYXhdKSlcbiAgICAuZGltZW5zaW9uKGRhdGVEaW1lbnNpb24pXG4gICAgLmdyb3VwKHByaWNlR3JvdXApO1xuXG4gIC8vZGMgc25pcHBldCBjaGFydFxuICB2YXIgc25pcHBldENoYXJ0ID0gZGMubGluZUNoYXJ0KCcjc25pcHBldC1jb250YWluZXInKTtcblxuICBzbmlwcGV0Q2hhcnRcbiAgICAud2lkdGgoNzAwKVxuICAgIC5oZWlnaHQoNDAwKVxuICAgIC5tYXJnaW5zKHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMjAsIGxlZnQ6IDYwfSlcbiAgICAucmVuZGVySG9yaXpvbnRhbEdyaWRMaW5lcyh0cnVlKVxuICAgIC5yZW5kZXJWZXJ0aWNhbEdyaWRMaW5lcyh0cnVlKVxuICAgIC5icnVzaE9uKGZhbHNlKVxuICAgIC54KGQzLnRpbWUuc2NhbGUoKS5kb21haW4odGltZUV4dGVudCkpXG4gICAgLnkoZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKHByaWNlRXh0ZW50KSlcbiAgICAuZGltZW5zaW9uKGRhdGVEaW1lbnNpb24pXG4gICAgLmdyb3VwKHByaWNlR3JvdXApO1xuXG5cbiAgbGluZUNoYXJ0Lm9uKCdmaWx0ZXJlZCcsIGZ1bmN0aW9uKGNoYXJ0LCBmaWx0ZXIpIHtcbiAgICBpZighZmlsdGVyKVxuICAgICAgcmV0dXJuO1xuXG4gICAgdmFyIHRpbWVNaW4gPSBmaWx0ZXJbMF07XG4gICAgdmFyIHRpbWVNYXggPSBmaWx0ZXJbMV07XG4gICAgc25pcHBldENoYXJ0LngoZDMudGltZS5zY2FsZSgpLmRvbWFpbihbdGltZU1pbiwgdGltZU1heF0pKTtcbiAgICBzbmlwcGV0Q2hhcnQucmVkcmF3KCk7ICAgICAgXG4gIH0pXG5cblxuXG5cbiAgLy9kYyBkYXRhIHRhYmxlXG4gIHZhciBkYXRhVGFibGUgPSBkYy5kYXRhVGFibGUoJyNkYy1kYXRhLXRhYmxlJyk7XG4gIHZhciBwYXJzZVRpbWUgPSBkMy50aW1lLmZvcm1hdChcIiViICVlICVIOiVNOiVTXCIpXG5cbiAgZGF0YVRhYmxlLndpZHRoKDk2MCkuaGVpZ2h0KDgwMClcbiAgICAuZGltZW5zaW9uKGRhdGVEaW1lbnNpb24pXG4gICAgLmdyb3VwKGZ1bmN0aW9uKGQpIHtcbiAgICAgIHJldHVybiBcIlwiXG4gICAgfSlcbiAgICAuc2l6ZSgyMDAwMClcbiAgICAuY29sdW1ucyhbXG4gICAgICBmdW5jdGlvbihkKSB7cmV0dXJuIHBhcnNlVGltZShkLnRpbWUpfSxcbiAgICAgIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC5sYXN0UHJpY2V9XG4gICAgXSk7XG5cbiAgZGMucmVuZGVyQWxsKCk7XG5cblxuICBzb2NrZXQub24oJ3ByaWNlJywgZnVuY3Rpb24ocHJpY2UpIHtcbiAgICBjb25zb2xlLmxvZygnbmV3IHByaWNlJyk7XG4gICAgdmFyIG5ld1ByaWNlID0ge31cbiAgICBuZXdQcmljZS50aW1lID0gbmV3IERhdGUocHJpY2UudGltZSk7XG4gICAgbmV3UHJpY2UubGFzdFByaWNlID0gcHJpY2UubGFzdFByaWNlO1xuXG5cbiAgICBpZihuZXdQcmljZS50aW1lLnRvU3RyaW5nKCkgIT09IGRhdGVEaW1lbnNpb24udG9wKDEpWzBdLnRpbWUudG9TdHJpbmcoKSkge1xuXG4gICAgICBiaXRzdGFtcERhdGEuYWRkKFtuZXdQcmljZV0pO1xuICAgICAgdXBkYXRlTGluZUNoYXJ0KCk7XG5cbiAgICAgIGRjLnJlZHJhd0FsbCgpOyAgICAgICAgICBcbiAgICB9XG5cbiAgfSlcblxuICBmdW5jdGlvbiB1cGRhdGVMaW5lQ2hhcnQoKSB7XG5cbiAgICAvL3VwZGF0ZSBwcmljZSByYW5nZSB3aXRoIHBhZGRpbmdcbiAgICB2YXIgdXBkYXRlZFByaWNlTWluID0gcHJpY2VEaW1lbnNpb24uYm90dG9tKDEpWzBdLmxhc3RQcmljZSAqIC45NzU7XG4gICAgdmFyIHVwZGF0ZWRQcmljZU1heCA9IHByaWNlRGltZW5zaW9uLnRvcCgxKVswXS5sYXN0UHJpY2UgKiAxLjAyNTtcblxuICAgIC8vdXBkYXRlIHRpbWUgcmFuZ2UgXG4gICAgdmFyIHVwZGF0ZWRUaW1lRXh0ZW50ID0gZDMudGltZS5zY2FsZSgpXG4gICAgICAuZG9tYWluKFt0aW1lRXh0ZW50WzBdLCBkYXRlRGltZW5zaW9uLnRvcCgxKVswXS50aW1lXSk7XG5cbiAgICBsaW5lQ2hhcnRcbiAgICAgIC54KHVwZGF0ZWRUaW1lRXh0ZW50KVxuICAgICAgLnkoZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKFt1cGRhdGVkUHJpY2VNaW4sIHVwZGF0ZWRQcmljZU1heF0pKTtcblxuXG4gIH1cblxufSIsInZhciBpbyA9IHJlcXVpcmUoJ3NvY2tldC5pby1jbGllbnQnKTtcbnZhciBzb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vbG9jYWxob3N0OjQwMDAnKTtcblxuc29ja2V0Lm9uKCdjb25uZWN0JywgZnVuY3Rpb24oKSB7XG4gIGNvbnNvbGUubG9nKCdjb25uZWN0ZWQgdG8gd2Vic29ja2V0cycpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc29ja2V0O1xuXG5cbiJdfQ==
