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