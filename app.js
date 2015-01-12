var express = require('express');
var config = require('./config/config');
var fs = require('fs');

var app = express();

require('./config/express')(app, config);

var server = app.listen(config.port);
var io = require('socket.io').listen(server)

console.log('app running on port ' + config.port);

io.sockets.on('connection', function(socket) {
  console.log('socket ioooooo')
})
