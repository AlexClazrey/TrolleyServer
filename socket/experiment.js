"use strict";
const io = require('./socket');
const experiment = io.of('experiment');

let phi = null, theta = null, timestamp = Date.now();
const angleHistory = [];

experiment.on('connection', function (socket) {
  io.addConnected(socket);
  console.log('[Experiment] experiment connected', socket.id);
  // data schema { phi: number, theta: number }
  socket.on('servo-command', function (data) {
    console.log('[Experiment] servo command:', data);
    experiment.emit('servo-command', data);
  });
  // data schema { timestamp: number, phi: number. theta: number }
  socket.on('servo-direction', function (data) {
    if (parseInt(data.timestamp) > timestamp) {
      timestamp = data.timestamp;
      if (data.phi)
        phi = data.phi;
      if (data.theta)
        theta = data.theta;
    }
    console.log('[Experiment] servo direction: ', data.phi, data.theta, '@', new Date(data.timestamp));
    experiment.emit('servo-direction', data);
  });
  socket.on('disconnect', function() {
    io.removeConnected(socket.id);
    console.log('[Experiment] experiment disconnected', socket.id);
  })
});

const getDirection = function (timestamp) {
  if (timestamp === undefined)
    return {phi, theta, timestamp};
  else {
    // TODO 查询历史记录啊。
  }
};

io.experiment = {
  getDirection
};

module.exports = io;
