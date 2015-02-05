var express = require('express');
var config = require('./config/config');
var mongoose = require('mongoose');
var fs = require('fs');
var app = express();


var server = app.listen(config.port);
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

// Init websockets connection
var io = require('socket.io')(server, {
  'polling duration': 10,
  'transports': ['polling']
});

// io.set("transports", ["xhr-polling"]); 
// io.set("polling duration", 10); 


var webSocket

io.on('connection', function(socket) {
  webSocket = socket;
});

//Start collecting data
var collectData = require('./libs/collect-data.js');

setInterval(function() {
  collectData().then(function(price) {
    webSocket.emit('new', price);    
  });    
}, 1200000)

