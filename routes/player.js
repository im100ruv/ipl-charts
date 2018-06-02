const express = require('express');
const router = express.Router();
const Match = require('../models/matches');
const Ball = require('../models/balls');

router.get('/', function (req, res) {
  res.status(200).json({ msg: "this is a player." });
});

module.exports = router;