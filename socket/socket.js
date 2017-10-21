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

io.logOnAnything = function (socket, prefix_opt) {
  const onevent = socket.onevent;
  socket.onevent = function (packet) {
    const args = packet.data || [];
    onevent.call(this, packet);    // original call
    packet.data = ["*"].concat(args);
    onevent.call(this, packet);      // additional call to catch-all
  };
  socket.on('*', function (event, data) {
    if (prefix_opt)
      console.log(prefix_opt, event, data, 'from', socket.id);
    else
      console.log(event, data, 'from', socket.id);
  });
};

io.removeConnected = function(id) {
  if(typeof id === 'string') {
    delete connectedSockets[id];
  } else if(id && id.id) {
    delete connectedSockets[id.id];
  } else {
    console.warn(__filename, 'Remove connected: cannot parse connection id');
  }
};

module.exports = io;