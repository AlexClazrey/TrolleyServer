var io = require('./socket');

var rssiSpace = io.of('rssi');
rssiSpace.on('connection', function(socket) {
  io.addConnected(socket);
  console.log('rssi browser connected', socket.id);
  socket.on('get-rssi-records', function(data) {
    if(data.tags) {
      //TODO
    }
  });
  socket.on('disconnect', function() {
    io.removeConnected(socket.id);
  })
});

io.rssiAdd = function(device, rssi, timestamp, tags) {
  rssiSpace.emit('rssi-record', {
    device: device,
    rssi: rssi,
    timestamp: timestamp,
    tags: tags
  });
};

module.exports = io;