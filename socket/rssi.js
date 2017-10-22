"use strict";
const io = require('./socket');
const mongodbRssi = require('../mongo/mongo.rssi');

const rssiSpace = io.of('rssi');
rssiSpace.on('connection', function(socket) {
  io.addConnected(socket);
  console.log('rssi browser connected', socket.id);
  // stat page functions
  socket.on('get-scan-groups', function() {
    mongodbRssi.getScanGroups().then(function(data) {
      socket.emit('get-scan-groups', data);
    }, function() {
      console.log('get-scan-groups failed');
    })
  });
  socket.on('get-rssi-records', function(data) {
    // query maybe device, tag or scanGroup
    const query = {};
    if(data.tag && typeof data.tag === 'string') {
      query.tag = data.tag;
    } else if(data.tag !== undefined) {
      console.error('[socket] Cannot read query item tag');
    }
    if(data.scanGroup && typeof data.scanGroup === 'string') {
      query.scanGroup = data.scanGroup;
    } else if(data.tag !== undefined) {
      console.error('[socket] Cannot read query item scan group');
    }
    if(data.device && typeof data.device === 'string') {
      const deviceAddressRegex = /([A-F0-9]{2}:){5}[A-F0-9]{2}/;
      if(!deviceAddressRegex.text(data.device)) {
        console.error('[socket] Cannot read query item device');
      } else {
        query.device = data.device;
      }
    } else if(data.tag !== undefined)  {
      console.error('[socket] Cannot read query item device');
    }
    // projection
    const projection = {
      // "_id": 0,
    };
    const sort = {};
    mongodbRssi.queryRssi(query, projection, sort).then(function(arr) {
      socket.emit('get-rssi-records', arr);
    }, function(err) {
      console.error('[socket] query failed');
      console.error(__filename, err);
    }).catch(function(err) {
      console.error(__filename, err);
    })
  });
  socket.on('disconnect', function() {
    io.removeConnected(socket.id);
  })
});

io.rssiAdd = function(device, rssi, timestamp, tag) {
  rssiSpace.emit('rssi-record', {
    device: device,
    rssi: rssi,
    timestamp: timestamp,
    tag: tag
  });
};

io.rssiAddV2 = function(data) {
  rssiSpace.emit('rssi-record-v2', data);
};

module.exports = io;