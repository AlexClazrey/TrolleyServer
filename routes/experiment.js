"use strict";
const express = require('express');
const router = express.Router();
const io = require('../socket/home');
const settings = require('../settings/settings');

/* GET servo control page. */
router.get('/', function (req, res) {
  res.setTimeout(settings.experimentTimeout, function() {
    res.render('experiment', {
      title: 'Remote Trolley Experiment',
      angle: {}
    });
  });
  io.experiment.getDirection().then(function(data) {
    res.render('experiment', {
      title: 'Remote Trolley Experiment',
      angle: {
        phi: data.phi,
        theta: data.theta,
        timestamp: data.timestamp && new Date(data.timestamp),
      }
    });
  }, function() {
    res.render('experiment', {
      title: 'Remote Trolley Experiment',
      angle: {}
    });
  });
});

module.exports = router;