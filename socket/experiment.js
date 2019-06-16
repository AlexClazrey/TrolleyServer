"use strict";
const io = require('./socket');
const experiment = io.of('experiment');

let phi = null, theta = null, timestamp = null;
const angleHistory = [];
const distanceHistory = [];
const historyThreshold = 1000;
const waitForAnswer = [];

function isNumber(data) {
  return typeof data === 'number';
}

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
      if (isNumber(data.phi))
        phi = data.phi;
      if (isNumber(data.theta))
        theta = data.theta;
    }
    if (angleHistory.length >= historyThreshold) {
      angleHistory.splice(0, 1);
    }
    angleHistory.push(data);
    console.log('[Experiment] servo direction: ', data.phi, data.theta, '@', parseInt(data.timestamp));
    experiment.emit('servo-direction', {phi, theta, timestamp: timestamp && new Date(timestamp)});
  }

  function receiveDistance(data) {
    const distance = parseInt(data.distance);
    if (distance) {
      if (distanceHistory.length >= historyThreshold) {
        distanceHistory.splice(0, 1);
      }
      distanceHistory.push(data);
      console.log('[Experiment] servo distance: ', data.distance, '@', parseInt(data.timestamp));
      experiment.emit('servo-distance', data);
    } else {
      console.warn('[Experiment] cannot parse data received');
    }
  }

// data schema { timestamp: number, phi: number. theta: number }
  socket.on('servo-direction', function (data) {
    receiveAngle(data);
  });
  socket.on('answer-servo-direction', function (data) {
    receiveAngle(data);
    while (waitForAnswer.length > 0) {
      waitForAnswer[0]({phi, theta, timestamp});
      waitForAnswer.splice(0, 1);
    }
  });
  socket.on('servo-distance', function (data) {
    receiveDistance(data);
  });
  socket.on('disconnect', function () {
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
        resolve({phi, theta, timestamp});
      }
    } else {
      // console.log('aaa2');
      if(angleHistory.length === 0) {
        console.log('[INFO] direction asked');
        waitForAnswer.push(resolve);
        experiment.emit('ask-servo-direction');
      }
      for (let i = angleHistory.length; i > 0; i--) {
        // console.log('aaa3', i);
        const left = angleHistory[i - 1];
        const right = angleHistory[i];
        if (left) {
          if (right) {
            if(inputTimestamp < right.timestamp && inputTimestamp >= left.timestamp) {
              resolve(left);
              return;
            }
          } else {
            resolve(left);
            return;
          }
        } else {
          reject(new Error('angle unknown'));
          return;
        }
      }
    }
  });
};

const getDistance = function (inputTimestamp) {return new Promise((resolve, reject) => {
  if (inputTimestamp === undefined) {
    if(distanceHistory.length > 0)
      resolve(distanceHistory[distanceHistory.length - 1]);
    else
      reject(new Error('distance unknown'));
  } else {
    console.log('distance', distanceHistory[0]);
    for (let i = distanceHistory.length; i > 0; i--) {
      const left = distanceHistory[i - 1];
      const right = distanceHistory[i];
      if (left) {
        if (right) {
          if(inputTimestamp < right.timestamp && inputTimestamp >= left.timestamp) {
            resolve(left);
            return;
          }
        } else {
          resolve(left);
          return;
        }
      } else {
        reject(new Error('distance unknown'));
        return;
      }
    }
    reject(new Error('distance unknown'));
  }
});
};

io.experiment = {
  getDirection,
  getDistance
};

module.exports = io;
