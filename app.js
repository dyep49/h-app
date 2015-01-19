var express = require('express');
var config = require('./config/config');
var mongoose = require('mongoose');
var fs = require('fs');
var collectData = require('./libs/collect-data.js');

var app = express();


var server = app.listen(config.port);
var io = require('socket.io').listen(server);
console.log('app running on port ' + config.port);


mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var modelsPath = __dirname + '/app/models';
fs.readdirSync(modelsPath).forEach(function (file) {
  if (file.indexOf('.js') >= 0) {
    require(modelsPath + '/' + file);
  }
});


io.sockets.on('connection', function(socket) {
  console.log('socket ioooooo')
})

// Execute commands in clean exit
process.on('exit', function () {
    console.log('Exiting ...');
    if (null != db) {
        db.close();
    }
    // close other resources here
    console.log('bye');
});

// happens when you press Ctrl+C
process.on('SIGINT', function () {
    console.log( '\nGracefully shutting down from  SIGINT (Crtl-C)' );
    process.exit();
});

// usually called with kill
process.on('SIGTERM', function () {
    console.log('Parent SIGTERM detected (kill)');
    // exit cleanly
    process.exit(0);
});

require('./config/express')(app, config);


//Start collecting data
setInterval(function() {
    collectData()
}, 30000)