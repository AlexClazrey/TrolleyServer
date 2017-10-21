const express = require('express');
const router = express.Router();
const io = require('../socket/home');

/* GET servo control page. */
router.get('/', function (req, res) {
  res.render('experiment', {
    title: 'Remote Trolley',
    angle: io.experiment.getDirection()
  });
});

module.exports = router;