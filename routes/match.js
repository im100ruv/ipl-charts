const express = require('express');
const router = express.Router();
const Match = require('../models/matches');
const Ball = require('../models/balls');

router.get('/:data', function (req, res) {
  if (req.params.data === "balls") {
    Ball.findOne(function (err, result) {
      res.status(200).json(result);
    });
  } else if (req.params.data === "matches") {
    Match.find(function (err, result) {
      res.status(200).json(result);
    });

  } else if (req.params.data === "mat-per-season") {
    Match.aggregate([
      {
        $group: {
          _id: "$season",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ], function (err, result) {
      result = result.map((obj) => {
        return { "name": obj._id, "y": obj.count };
      });
      res.status(200).json(result);
    });

  } else if (req.params.data === "won-stack") {
    Match.aggregate([
      {
        "$group": {
          _id: {$cond: [{$eq: ["$winner", "Rising Pune Supergiants"]}, "Rising Pune Supergiant", {$cond: [{$eq: ["$winner", ""]}, "No Result", "$winner"]}]},
          wins: {$sum: 1}
        }
      },{
        $sort: {wins: 1}
      }
    ], function (err, result) {
      
      res.status(200).json(result);
      // res.status(200).json({ "dataFeed": dataFeed, "teamNames": dataTeamNames });
    });
  }
});

module.exports = router;

