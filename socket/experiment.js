"use strict";
const socket = require('./socket');
const experiment = socket.of('experiment');

let phi = null, alpha = null, timestamp = Date.now();

experiment.on('connection', function(socket) {
  io.addConnected(socket);
  console.log('experiment connected', socket.id);
  // data schema { phi: number, theta: number }
  socket.on('servo-command', function(data) {
    console.log('[Experiment] servo command:', data);
    experiment.emit('servo-command', data);
  });
  // data schema { timestamp: number, phi: number. theta: number }
  socket.on('servo-direction', function(data) {
    if(parseInt(data.timestamp) > timestamp) {
      timestamp = data.timestamp;
      if (data.phi)
        phi = data.phi;
      if (data.alpha)
        alpha = data.alpha;
    }
    console.log('[Experiment] servo direction: ', data.phi, data.alpha, '@', data.timestamp);
    experiment.emit('servo-direction', data);
  });
});

const getDirection = function() {
  return {
    phi,
    alpha
  };
};

io.experiment = {
  getDirection
};

module.exports = io;
