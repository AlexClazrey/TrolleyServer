const express = require('express');
const router = express.Router();
const io = require('../socket/home');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('control', {
    title: 'Remote Car',
    cars: io.getConnected('car'),
    users: io.getConnected('browser')
  });
});

module.exports = router;
