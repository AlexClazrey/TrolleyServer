var io = require('./socket');

var car = io.of('car');
var browser = io.of('browser');

browser.on('connection', function(socket) {
  io.addConnected(socket);
  console.log('#', socket.id, 'browser connected');
  socket.on('car-command', function(data) {
    console.log('command got: ', data);
    car.emit('command', data);
  });
  socket.on('disconnect', function() {
    console.log('#', socket.id, 'browser disconnected');
  });
});

car.on('connection', function(socket) {
  io.addConnected(socket);
  console.log('#', socket.id, 'car connected');
  socket.on('disconnect', function() {
    console.log('#', socket.id, 'car disconnected');
  });
});

module.exports = io;