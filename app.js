var express = require('express');
var config = require('./config/config');
var fs = require('fs');

var app = express();

var server = app.listen(config.port);
var io = require('socket.io').listen(server)

require('./config/express')(app, config);

app.listen(config.port);
console.log('app running on port ' + config.port);

// io.sockets.on('connection', function(socket) {
//   socket.emit('test', {test: 'this is a test'});
// })
