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

