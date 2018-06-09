const express = require('express');
const router = express.Router();
const Match = require('../models/matches');
const Ball = require('../models/balls');

function matPerSeason(res) {
  Match.aggregate([
    {
      $group: {
        _id: "$season",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }, {
      $project: { _id: 0, name: "$_id", y: "$count" }
    }
  ], (err, result) => {
    if (err) {
      res.status(500).send(err);
    }
    res.status(200).json(result);
  });
}

function wonStack(res) {
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
    if (err) {
      res.status(500).send(err);
    }
    let stdResult = result.reduce((acc, elem) => {
      acc[elem.team] = elem.yearsPlayed.reduce((subacc, subelem) => {
        subacc[subelem.year] = subelem.wins;
        return subacc;
      }, {});
      return acc;
    }, {});

    let dataTeamNames = Object.keys(stdResult)

    let years = Object.keys(stdResult).reduce((acc, team) => {
      Object.keys(stdResult[team]).forEach(yr => {
        if (!acc.includes(yr)) {
          acc.push(yr)
        }
      });
      return acc;
    }, []);

    let dataFeed = years.reduce((acc, yr, i) => {
      acc.push({ "name": yr, "data": [] });
      dataTeamNames.forEach(team => {
        if (stdResult[team][yr]) {
          acc[i]["data"].push(stdResult[team][yr]);
        } else {
          acc[i]["data"].push(0);
        }
      });
      return acc;
    }, []);

    res.status(200).json({ "dataFeed": dataFeed, "teamNames": dataTeamNames });
  });
}

function extraRuns(res) {
  Match.aggregate([
    {
      $match: { season: 2016 }
    }
  ], function (err, matIds) {
    matIds = matIds.map(obj => {
      return obj.id;
    });
    Ball.aggregate([
      {
        $match: { match_id: { $gte: parseInt(matIds[0]), $lte: parseInt(matIds[matIds.length - 1]) } }
      }, {
        $project: { _id: 0, bowling: "$bowling_team", extra: "$extra_runs" }
      }
    ], function (err, result) {
      if (err) {
        res.status(500).send(err);
      }
      let extraRunsPerTeam = result.reduce((acc, elem) => {
        if (elem.bowling in acc) {
          acc[elem.bowling] += elem.extra;
        } else {
          acc[elem.bowling] = elem.extra;
        }
        return acc;
      }, {});

      let dataFeed = Object.keys(extraRunsPerTeam).reduce((acc, key)=>{
        acc.push({ "name": key, "y": extraRunsPerTeam[key] })
        return acc;
      }, []);

      res.status(200).json({ "dataFeed": dataFeed, "teams": Object.keys(extraRunsPerTeam) });
    });
  });
}

router.get('/:data', function (req, res) {
  if (req.params.data === "mat-per-season") {
    matPerSeason(res);
  } else if (req.params.data === "won-stack") {
    wonStack(res);
  } else if (req.params.data === "extra-runs") {
    extraRuns(res);
  } else {
    res.status(404).send(" Failed to load resource: the server responded with a status of 404 (Not Found)");
  }
});

module.exports = router;
