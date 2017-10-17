var express = require('express');
var router = express.Router();

var deviceRssi = {};

router.post('/', function (req, res) {
  var device = req.body.device;
  var rssi = req.body.rssi;
  if (deviceRssi[device]) {
    deviceRssi[device].push(rssi);
  } else {
    deviceRssi[device] = [rssi];
  }
  console.log('upload received', req.body);
  if (device && rssi) {
    res.send("upload success");
  } else {
    res.send("upload failed");
  }
});

router.get('/', function (req, res) {
  var result = Object.keys(deviceRssi).map(function (item) {
    return {device: item, rssi: deviceRssi[item]};
  });
  res.render("rssi", {
    title: 'rssi list',
    deviceRssi: result
  });
});

module.exports = router;