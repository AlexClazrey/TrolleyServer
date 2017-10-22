"use strict";
const io = require('./socket');

const car = io.of('car');
const browser = io.of('browser');

browser.on('connection', function(socket) {
  io.addConnected(socket);
  console.log('#', socket.id, 'browser connected');
  socket.on('car-command', function(data) {
    console.log('command got: ', data);
    car.emit('command', data);
  });
  socket.on('disconnect', function() {
    io.removeConnected(socket.id);
    console.log('#', socket.id, 'browser disconnected');
  });
});

car.on('connection', function(socket) {
  io.addConnected(socket);
  console.log('#', socket.id, 'car connected');
  socket.on('disconnect', function() {
    io.removeConnected(socket.id);
    console.log('#', socket.id, 'car disconnected');
  });
  socket.on('obstacle', function(data) {
    console.log('[CAR] obstacle ' + data.distance + 'cm' + ' at ' + data.direction + 'deg' + ' at ' + new Date(parseInt(data.timestamp)));
  })
});

module.exports = io;