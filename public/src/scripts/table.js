'use strict';

var d3 = require('d3');

function tabulate() {

  function capitalize(string) {
    return string.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  }

  function table(selection) {
    selection.each(function(data) {

      //Create array of columns from data keys
      var columns = [];
      var dataSample = data[0];

      for(var key in dataSample) {
        columns.push(key);
      }

      //Create array of data
      var cellData = data.map(function(row) {
        return columns.map(function(column) {
          return {column: column, value: row[column]};
        });
      });

      //Select the svg element if it exists
      var table = d3.select(this).selectAll('table').data([data]);

      var tEnter = table.enter().append('table');
      var thead = tEnter.append('thead');
      var tbody = tEnter.append('tbody');


      //Append header row
      thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function(column) {return capitalize(column);});


      //Create Rows
      var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

      //Create cells in each row for each column
      var cells = rows.selectAll('td')
        .data(function(row) {
          return columns.map(function(column) {
            return {column: column, value: row[column]};
          });
        })
        .enter()
        .append('td')
        .html(function(d) { return d.value; });
    });

  }

  return table;
}

module.exports = tabulate;


