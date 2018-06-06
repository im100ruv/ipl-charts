const express = require('express');
const router = express.Router();
const Match = require('../models/matches');
const Ball = require('../models/balls');

router.get('/:data', function (req, res) {
  if (req.params.data === "bowler-economy") {
    Match.aggregate([
      {
        $match: { season: 2015 }
      }
    ], function (err, matIds) {
      matIds = matIds.map(obj => {
        return obj.id;
      });
      Ball.aggregate([
        {
          $match: { match_id: { $gte: matIds[0], $lte: matIds[matIds.length - 1] + 1 } }
        }, {
          $group: {
            _id: "$bowler",
            balls: { $sum: { $cond: [ { $and: [ { $ne: [ "$wide_runs", "0" ] }, { $ne: [ "$noball_runs", "0" ] } ] }, 1, 0 ] } },
            runs: { $sum: { $add: ["$wide_runs", "$noball_runs", "$batsman_runs"] } }
          }
        }, {
          $match: { balls: { $gte: 60 } }
        }, {
          $project: {
            _id: 0,
            bowler: "$_id",
            balls: "$balls",
            runs: "$runs",
            economy: { $sum: { $multiply: [{ $divide: ["$runs", "$balls"] }, 6] } }
          }
        }, {
          $sort: { economy: 1 }
        }, {
          $limit: 15
        }
      ], function (err, result) {
        let dataFeed = [];
        result.forEach(elem => {
          dataFeed.push({ "name": elem.bowler, "y": elem.economy });
        });

        let sortedNames = dataFeed.map(elem => {
          return elem.name;
        });

        res.status(200).json({ "names": sortedNames, "dataFeed": dataFeed });
      });
    });

  } else if (req.params.data === "batsman-high") {
    Ball.aggregate([
      {
        $group: {
          _id: {
            match: "$match_id",
            batsman: "$batsman"
          },
          batruns: { $sum: "$batsman_runs" }
        }
      }, {
        $project: {
          _id: 0,
          match: "$_id.match",
          batsman: "$_id.batsman",
          runs: "$batruns"
        }
      }, {
        $group: {
          _id: "$batsman",
          high: { $max: "$runs" }
        }
      }, {
        $sort: { "high": -1 }
      }
    ], function (err, result) {
      let stdResult = {};
      result.forEach(elem => {
        stdResult[elem._id] = elem.high;
      });

      res.status(200).json({ "names": Object.keys(stdResult), "dataFeed": Object.values(stdResult) });
    });
  }
});

module.exports = router;