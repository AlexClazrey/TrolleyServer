var express = require('express');
var router = express.Router();
// var io = require('../socket/home');

/* GET home page. */
router.get('/', function (req, res) {
  res.redirect('/control');
});

module.exports = router;
