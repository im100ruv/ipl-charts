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
          $project: {
            _id: 0,
            bowler: "$bowler",
            wide: "$wide_runs",
            noball: "$noball_runs",
            batruns: "$batsman_runs"
          }
        }, {
          $group: {
            _id: "$bowler",
            balls: { $sum: 1 },
            wide: { $sum: "$wide" },
            noball: { $sum: "$noball" },
            batruns: { $sum: "$batruns" },
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
        for (const key of Object.keys(bowlersEconomy)) {
          if (bowlersEconomy[key]["balls"] >= 60) {
            dataFeed.push({ "name": key, "y": bowlersEconomy[key]["economy"] })
          }
        }

        dataFeed.sort(function (a, b) {
          return a.y - b.y
        });
        let sortedNames = [];
        for (const i in dataFeed) {
          sortedNames[i] = dataFeed[i].name;
        }
        
        res.status(200).json({ "names": sortedNames, "dataFeed": dataFeed });
      });
    });
  }
});

module.exports = router;