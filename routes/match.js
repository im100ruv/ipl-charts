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
        $group: {
          _id: {
            team: { $cond: [{ $eq: ["$winner", "Rising Pune Supergiants"] }, "Rising Pune Supergiant", { $cond: [{ $eq: ["$winner", ""] }, "No Result", "$winner"] }] },
            wins: "$season"
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          winner: "$_id.team",
          year: "$_id.wins",
          wins: "$count"
        }
      }, {
        $sort: { "winner": 1 }
      }, {
        $group: {
          _id: "$winner",
          wins: {
            $push: {
              year: "$year",
              wins: "$wins"
            }
          }
        }
      }, {
        $project: {
          _id: 0,
          team: "$_id",
          yearsPlayed: "$wins"
        }
      }
    ], function (err, result) {
      let stdResult = {};
      result.forEach(elem => {
        stdResult[elem.team] = {};
        elem.yearsPlayed.forEach(subelem => {
          stdResult[elem.team][subelem.year] = subelem.wins;
        });
      });

      let dataTeamNames = Object.keys(stdResult)

      let years = [];
      for (const key in stdResult) {
        Object.keys(stdResult[key]).forEach(elem => {
          if (!years.includes(elem)) {
            years.push(elem)
          }
        });
      }
      years.sort((a, b) => {
        return a - b;
      })

      let dataFeed = [];
      for (const i in years) {
        dataFeed.push({ "name": years[i], "data": [] });
        for (const j in dataTeamNames) {
          let team = dataTeamNames[j];
          if (stdResult[team][years[i]]) {
            dataFeed[i]["data"].push(stdResult[team][years[i]]);
          } else {
            dataFeed[i]["data"].push(0);
          }
        }
      }

      res.status(200).json({ "dataFeed": dataFeed, "teamNames": dataTeamNames });
    });
  }
});

module.exports = router;

