"use strict";
const io = require('./socket');
const experiment = io.of('experiment');

let phi = null, theta = null, timestamp = null;
const angleHistory = [];
const waitForAnswer = [];

experiment.on('connection', function (socket) {
  io.addConnected(socket);
  console.log('[Experiment] experiment connected', socket.id);
  // data schema { phi: number, theta: number }
  socket.on('servo-command', function (data) {
    console.log('[Experiment] servo command:', data);
    experiment.emit('servo-command', data);
  });

  function receiveAngle(data) {
    if (parseInt(data.timestamp) > timestamp) {
      timestamp = data.timestamp;
      if (data.phi)
        phi = data.phi;
      if (data.theta)
        theta = data.theta;
    }
    console.log('[Experiment] servo direction: ', data.phi, data.theta, '@', parseInt(data.timestamp));
    experiment.emit('servo-direction', {phi, theta, timestamp: timestamp && new Date(timestamp)});
  }

// data schema { timestamp: number, phi: number. theta: number }
  socket.on('servo-direction', function (data) {
    receiveAngle(data);
  });
  socket.on('answer-servo-direction', function(data) {
    receiveAngle(data);
    while(waitForAnswer.length > 0) {
      waitForAnswer[0]({phi, theta, timestamp: timestamp && new Date(timestamp)});
      waitForAnswer.splice(0, 1);
    }
  });
  socket.on('disconnect', function() {
    io.removeConnected(socket.id);
    console.log('[Experiment] experiment disconnected', socket.id);
  })
});

const getDirection = function (inputTimestamp) {
  return new Promise((resolve, reject) => {
    if (inputTimestamp === undefined) {
      if (!phi || !theta) {
        console.log('[INFO] direction asked');
        waitForAnswer.push(resolve);
        experiment.emit('ask-servo-direction');
      } else {
        resolve({phi, theta, timestamp: timestamp && new Date(timestamp)});
      }
    }
    else {
      reject(new Error('under developing'));
      // TODO 查询历史记录啊。
    }
  });
};

io.experiment = {
  getDirection
};

module.exports = io;
