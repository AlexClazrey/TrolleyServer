var express = require('express');
var router = express.Router();
var io = require('../socket/home');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('control', {
    title: 'Remote Trolley',
    cars: io.getConnected('car'),
    users: io.getConnected('browser')
  });
});

module.exports = router;
