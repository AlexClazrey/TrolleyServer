const express = require('express');
const router = express.Router();

const rssiSocket = require('../socket/rssi');
const mongodbRssi = require('../mongo/mongo.rssi');

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
  const group = req.body.scanGroup;
  const phone = req.body.phone;
  let distance = req.body.distance;
  let angle = [req.body.anglePhi, req.body.angleTheta];

  if(!distance || distance === 'null') {
    distance = null;
  } else {
    distance = parseFloat(distance);
  }
  angle = angle.map(function (item) {
    if(!item || item === 'null')
      return null;
    else
      return parseFloat(item);
  });

// save
  const record = {
    device,
    phone,
    tag: tags,
    time: new Date(parseInt(timestamp)),
    group,
    distance,
    angle,
    RSSI: parseInt(rssi),
  };

  // trigger socket and database event
  if(deviceFilterEnabled) {
    if(deviceFilter.indexOf(device) > -1) {
      rssiSocket.rssiAdd(device, rssi, timestamp, tags);
      mongodbRssi.addHandler(record);
    }
  } else {
    rssiSocket.rssiAdd(device, rssi, timestamp, tags);
    mongodbRssi.addHandler(record);
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
  res.render('rssi-vue', {
    title: 'rssi list'
  });
});

module.exports = router;