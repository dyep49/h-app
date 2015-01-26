var dc = require('dc');
var socket = require('./websockets.js');

module.exports = function() {
  var mostRecent;
  var priceMin;
  var priceMax;

  //prep data for dc/crossfilter
  var parsedPrices = JSON.parse(prices);
  var data = parsedPrices.map(function(price, index) {
    price.time = new Date(price.time);
    return price;
  });

  mostRecent = data[data.length - 1];

  var bitstampData = crossfilter(data);
  var all = bitstampData.groupAll();



  var dateDimension = bitstampData.dimension(function(d) {
    return d.time;
  });

  var priceDimension = bitstampData.dimension(function(d) {
    return d.lastPrice;
  });

  var unfilteredPriceDimension = bitstampData.dimension(function(d) {
    return d.lastPrice;
  })

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