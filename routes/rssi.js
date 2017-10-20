const express = require('express');
const router = express.Router();

const rssiSocket = require('../socket/rssi');

const deviceRssi = {};

const deviceFilterEnabled = true;
const deviceFilter = [
  "3C:A3:08:AC:58:8D",
  "3C:A3:08:AC:37:BB",
  "D4:36:39:BC:08:F3",
  "34:15:13:1A:E4:6A"
];

router.post('/', function (req, res) {
  // parse
  const device = req.body.device;
  const rssi = req.body.rssi;
  const timestamp = req.body.timestamp;
  const tags = req.body.tags;

  // save
  const record = {
    rssi: rssi,
    timestamp: timestamp,
    tags: tags
  };
  if (deviceRssi[device]) {
    deviceRssi[device].push(record);
  } else {
    deviceRssi[device] = [record];
  }

  // trigger socket event
  if(deviceFilterEnabled) {
    if(deviceFilter.indexOf(device) > -1) {
      rssiSocket.rssiAdd(device, rssi, timestamp, tags);
    }
  } else {
    rssiSocket.rssiAdd(device, rssi, timestamp, tags);
  }

  // reply
  console.log('upload received', req.body);
  if (device && rssi && timestamp) {
    res.send("upload success");
  } else {
    res.send("upload failed");
  }
});

router.get('/', function (req, res) {
  const result = Object.keys(deviceRssi)
    .filter(function (item) {
      if(deviceFilterEnabled)
        return deviceFilter.indexOf(item) > -1;
      else
        return true;
    })
    .map(function (item) {
      return {device: item, records: deviceRssi[item]};
    });
  res.render("rssi", {
    title: 'rssi list',
    deviceRssi: result
  });
});

router.get('/auto', function (req,res) {
  res.render('rssi-vue', {
    title: 'rssi list'
  });
});

module.exports = router;