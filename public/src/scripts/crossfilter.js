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