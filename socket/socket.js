const socketIO = require('socket.io');
const io = socketIO();

const connectedSockets = {};

io.getConnected = function(namespace) {
  if(namespace) {
    return Object.keys(io.of(namespace).sockets);
  } else {
    return Object.keys(io.sockets.sockets);
  }
};

io.getSocketById = function(id) {
  return connectedSockets[id];
};

io.addConnected = function(socket) {
  connectedSockets[socket.id] = socket;
};

io.removeConnected = function(id) {
  if(typeof id === 'string') {
    delete connectedSockets[id];
  } else if(id.id) {
    delete connectedSockets[id.id];
  } else {
    console.warn(__filename, 'Remove connected: cannot parse connection id');
  }
};

module.exports = io;