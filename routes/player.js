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
          $match: { match_id: { $gte: parseInt(matIds[0]), $lte: parseInt(matIds[matIds.length - 1]) } }
        }, {
          $group: {
            _id: "$bowler",
            balls: { $sum: 1 },
            wide: { $sum: "$wide_runs" },
            noball: { $sum: "$noball_runs" },
            batruns: { $sum: "$batsman_runs" },
            // economy: { $multiply: [ { $divide: [ { $add: [ "$wide", "$batruns" ] }, "$balls" ] }, 6 ] }
          }
        }
      ], function (err, result) {
        let bowlersEconomy = {};
        result.forEach(elem => {
          let bowler = elem._id;
          let runs = parseInt(elem.wide) + parseInt(elem.noball) + parseInt(elem.batruns);
          let balls = parseInt(elem.balls);

          bowlersEconomy[bowler] = {};

          bowlersEconomy[bowler]["runs"] = runs;
          bowlersEconomy[bowler]["balls"] = balls;
          bowlersEconomy[bowler]["economy"] = (runs / balls) * 6;
        });

        let dataFeed = [];
        for (const key in bowlersEconomy) {
          if (bowlersEconomy[key]["balls"] >= 60) {
            dataFeed.push({ "name": key, "y": bowlersEconomy[key]["economy"] })
          }
        }

        dataFeed.sort(function (a, b) {
          return a.y - b.y
        });
        let sortedNames = dataFeed.map(elem => {
          return elem.name
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