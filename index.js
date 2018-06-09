function createChart(xNames, dataFeed, xTitle, yTitle, subTitle, pt='{point.y:%f}') {
  Highcharts.chart('container', {
    chart: { type: 'column' },
    title: { text: 'IPL Analysis' },
    subtitle: { text: subTitle },
    yAxis: { title: { text: yTitle } },
    xAxis: {
      categories: xNames,
      title: { text: xTitle }
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: pt
        }
      }
    },
    "series": [
      {
        "data": dataFeed,
        name: "Matches",
        colorByPoint: true,
        showInLegend: false
      }
    ]
  });
}

function createStackChart(xNames, dataFeed, xTitle, yTitle, subTitle) {
  Highcharts.chart('container', {
    chart: { type: 'column' },
    title: { text: 'IPL Analysis' },
    subtitle: { text: subTitle },
    xAxis: {
      categories: xNames,
      title: { text: xTitle }
    },
    yAxis: {
      min: 0,
      title: { text: yTitle },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        }
      }
    },
    legend: {
      align: 'right',
      x: -30,
      verticalAlign: 'top',
      y: 25,
      floating: true,
      backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
      borderColor: '#CCC',
      borderWidth: 1,
      shadow: false
    },
    tooltip: {
      headerFormat: '<b>{point.x}</b><br/>',
      pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
    },
    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: false,
          color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
        }
      }
    },
    series: dataFeed
  });
}

$(document).ready(() => {
  let matchesJson;
  let deliveriesJson;

  function toJson(csvData) {
    let lines = csvData.split("\n");
    let colNames = lines[0].split(",");
    let records = [];
    colNames = colNames.map(function (h) {
      return h.trim();
    });
    for (let i = 1; i < lines.length - 1; i++) {
      let record = {};
      let bits = lines[i].split(",");
      for (let j = 0; j < bits.length; j++) {
        record[colNames[j]] = bits[j].trim();
      }
      records.push(record);
    }
    return records;//JavaScript object
    // return JSON.stringify(result); //JSON
  }

  // ================================================
  // //using promises one after the other
  // Promise.all([
  //   "CSVs/matches.csv",
  //   "CSVs/deliveries.csv"
  // ].map(function (url) {
  //   return fetch(url)
  //   .then(function (response) {
  //     return response.ok ? response.text() : Promise.reject(response.status);
  //   }).then(function (text) {
  //     return toJson(text);
  //   });
  // })).then(function (value) {
  //   matchesJson = value[0],
  //   deliveriesJson = value[1];
  //   $('p').attr("hidden","");
  //   $('div').removeAttr("hidden");
  // }).catch(err => console.error(err));
  // =====================================================

  // --------------------------------------------------------
  //using async-await
  prepareData().then(() => {
    $('p').attr("hidden", "");
    $('div').removeAttr("hidden");
  }).catch(err => console.error(err));

  async function prepareData() {
    let matResponse = await fetch("CSVs/matches.csv");
    matchesJson = toJson(await matResponse.text());
    let delResponse = await fetch("CSVs/deliveries.csv");
    deliveriesJson = toJson(await delResponse.text());
    return;
  }
  // -------------------------------------------------------

  function getMatchSeason() {
    return matchesJson.reduce((acc, elem) => {
      let year = elem.season;
      (year in acc) ? acc[year]++ : acc[year] = 1;
      return acc;
    }, {});
  }

  $('#show-mat-per-seas').click(function () {
    let matchPerSeason = getMatchSeason();
    let dataFeed = Object.keys(matchPerSeason).map(year => {
      return { "name": year, "y": matchPerSeason[year] };
    });
    createChart(Object.keys(matchPerSeason), dataFeed, "Year", "Matches", 'Matches per Season');
  })

  $('#show-won-stack').click(function () {
    let winsPerSeason = matchesJson.reduce((acc, match) => {
      let winner = match.winner;
      if (winner == "Rising Pune Supergiants") { winner = "Rising Pune Supergiant" }
      if (winner == "") { winner = "No Result" }

      let year = match.season;
      if (year in acc) {
        (acc[year][winner]) ? acc[year][winner]++ : acc[year][winner] = 1;
      } else {
        acc[year] = {};
        acc[year][winner] = 1;
      }
      return acc;
    }, {});

    let years = Object.keys(winsPerSeason);

    let dataTeamNames = years.reduce((acc, yr) => {
      Object.keys(winsPerSeason[yr]).forEach(team => {
        if (!acc.includes(team)) {
          acc.push(team);
        }
      });
      return acc;
    }, []);

    let dataFeed = years.reduce((acc, yr, i) => {
      acc.push({ "name": yr, "data": [] });
      dataTeamNames.forEach(team => {
        if (winsPerSeason[yr][team]) {
          acc[i]["data"].push(winsPerSeason[yr][team]);
        } else {
          acc[i]["data"].push(0);
        }
      });
      return acc;
    }, []);

    createStackChart(dataTeamNames, dataFeed, "Teams", "Matches Won", "Matches won per year");
  })

  $('#show-extra-runs').click(function () {
    let matchPerSeason = getMatchSeason();

    let sum = Object.keys(matchPerSeason).reduce((sum, year) => {
      if (year <= 2016) { return sum + matchPerSeason[year]; }
      return (year <= 2016) ? sum + matchPerSeason[year] : sum;
    }, 0)

    //since last season(2017) is at the top, Add 2017 matches to sum
    // replace 2017 with current season for other times
    sum += matchPerSeason[2017];
    let matchNoEnd16 = sum;
    let matchNoStart16 = sum - matchPerSeason[2016] + 1;

    let extraRunsPerTeam = deliveriesJson.reduce((acc, elem) => {
      if ((elem["match_id"] >= matchNoStart16) && (elem["match_id"] <= matchNoEnd16)) {
        let bowlingTeam = elem["bowling_team"];
        let extraRuns = parseInt(elem["extra_runs"]);
        if (bowlingTeam in acc) {
          acc[bowlingTeam] += extraRuns;
        } else {
          acc[bowlingTeam] = extraRuns;
        }
      }
      return acc;
    }, {});

    let dataFeed = Object.keys(extraRunsPerTeam).map(year => {
      return { "name": year, "y": extraRunsPerTeam[year] };
    });
    createChart(Object.keys(extraRunsPerTeam), dataFeed, "Team", "Runs", "Extras per Team (in 2016)");
  })

  $('#show-bowler-economy').click(function () {
    let matchPerSeason = getMatchSeason();

    let sum = Object.keys(matchPerSeason).reduce((sum, year) => {
      if (year <= 2015) return sum + matchPerSeason[year];
      return (year <= 2015) ? sum + matchPerSeason[year] : sum;
    }, 0)
    //since last season(2017) is at the top, Add 2017 matches to sum
    // replace 2017 with current season for other times
    sum += matchPerSeason[2017];
    let matchNoEnd15 = sum;
    let matchNoStart15 = sum - matchPerSeason[2015] + 1;

    let bowlersEconomy = deliveriesJson.reduce((acc, elem) => {
      if ((elem["match_id"] >= matchNoStart15) && (elem["match_id"] <= matchNoEnd15)) {
        let bowler = elem["bowler"];
        let runs = parseInt(elem["wide_runs"]) + parseInt(elem["noball_runs"]) + parseInt(elem["batsman_runs"]);
        if (bowler in acc) {
          acc[bowler]["runs"] += runs;
          if (!Number(elem["wide_runs"]) && !Number(elem["noball_runs"])) {
            acc[bowler]["balls"] += 1;
          }
          acc[bowler]["economy"] = (acc[bowler]["runs"] / acc[bowler]["balls"]) * 6;
        } else {
          acc[bowler] = {};
          acc[bowler]["runs"] = runs;
          acc[bowler]["balls"] = (!Number(elem["wide_runs"]) && !Number(elem["noball_runs"])) ? 1 : 0;
          acc[bowler]["economy"] = (acc[bowler]["runs"] / acc[bowler]["balls"]) * 6;
        }
      }
      return acc;
    }, {});

    let dataFeed = [];
    for (const key in bowlersEconomy) {
      if (bowlersEconomy[key]["balls"] >= 60) {
        dataFeed.push({ "name": key, "y": bowlersEconomy[key]["economy"] })
      }
    }

    dataFeed.sort(function (a, b) {
      return a.y - b.y
    });

    let sortedNames = dataFeed.map(obj => {
      return obj.name;
    });

    createChart(sortedNames, dataFeed.slice(0, 15), "Bowlers", "Economy", "Economical Bowlers (Top 15 in 2015 : min 10 overs)", '{point.y:.2f}');
  })

  $('#show-high-ind-score').click(function () {
    let matchData = deliveriesJson.reduce((acc, delv) => {
      let matchId = delv.match_id;
      let batsman = delv.batsman;
      let run = parseInt(delv.batsman_runs);
      if (matchId in acc) {
        if (batsman in acc[matchId]) {
          acc[matchId][batsman] += run;
        } else {
          acc[matchId][batsman] = run;
        }
      } else {
        acc[matchId] = {};
        acc[matchId][batsman] = run;
      }
      return acc;
    }, {});

    let batsmenHighScore = Object.keys(matchData).reduce((acc, match) => {
      Object.keys(matchData[match]).forEach(batsman => {
        if (batsman in acc) {
          if (acc[batsman] < matchData[match][batsman]) {
            acc[batsman] = matchData[match][batsman];
          }
        } else {
          acc[batsman] = matchData[match][batsman];
        }
      });
      return acc;
    }, {});

    let sortedNames = Object.keys(batsmenHighScore).sort(function (a, b) {
      return batsmenHighScore[b] - batsmenHighScore[a];
    });

    let sortedScore = sortedNames.map(elem => {
      return batsmenHighScore[elem];
    });

    createChart(sortedNames.slice(0, 15), sortedScore.slice(0, 15), "Batsman", "Runs", "Highest Individual Score (Top 15)");
  })
});
