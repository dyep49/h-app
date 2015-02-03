var io = require('socket.io-client');
var socket = io.connect('/');

socket.on('connect', function() {
  document.querySelector('.websockets-connect').style.display = 'inline';
  document.querySelector('.websockets-disconnect').style.display = 'none';
});

socket.on('disconnect', function() {
  document.querySelector('.websockets-connect').style.display = 'none';
  document.querySelector('.websockets-disconnect').style.display = 'inline';
})


module.exports = socket;


