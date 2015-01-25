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