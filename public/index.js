let matchesJson;
let deliveriesJson;
getMatches();
getDeliveries();

function toJson(csvData) {
  let lines = csvData.split("\n");
  let colNames = lines[0].split(",");
  colNames = colNames.map(function (h) {
    return h.trim();
  });
  let records = [];
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

function getMatches() {
  let rawFile = new XMLHttpRequest();
  rawFile.open("GET", './CSVs/matches.csv', true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        let allText = rawFile.responseText;
        matchesJson = toJson(allText);
      }
    }
  }
  rawFile.send(null);
};

function getDeliveries() {
  let rawFile = new XMLHttpRequest();
  rawFile.open("GET", './CSVs/deliveries.csv', true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        let allText = rawFile.responseText;
        deliveriesJson = toJson(allText);
      }
    }
  }
  rawFile.send(null);
};

$('#show-mat-per-seas').click(function () {
  $.get("/match/mat-per-season", function (result) {
    let years = result.map(function (obj) {
      return obj.name;
    });
    // Create the chart
    Highcharts.chart('container', {
      chart: { type: 'column' },
      title: { text: 'IPL Analysis' },
      subtitle: { text: 'Matches per Season' },
      yAxis: { title: { text: 'Matches' } },
      xAxis: {
        categories: years,
        title: { text: "Year" }
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y:%f}'
          }
        }
      },
      "series": [
        {
          "data": result,
          colorByPoint: true,
          showInLegend: false
        }
      ]
    });
  });
})

$('#show-won-stack').click(function () {
  $.get("/match/won-stack", function (result) {
    // create the chart
    Highcharts.chart('container', {
      chart: { type: 'column' },
      title: { text: 'IPL Analysis' },
      subtitle: { text: 'Matches won per year' },
      xAxis: {
        categories: result.teamNames
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Matches Won'
        },
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
      series: result.dataFeed
    });
  });
})

$('#show-extra-runs').click(function () {
  $.get("/match/extra-runs", function (result) {
    // Create the chart
    Highcharts.chart('container', {
      chart: { type: 'column' },
      title: { text: 'IPL Analysis' },
      subtitle: { text: 'Extras per Team (in 2016)' },
      yAxis: { title: { text: 'Runs' } },
      xAxis: {
        categories: result.teams,
        title: { text: "Team" }
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y:%f}'
          }
        }
      },
      "series": [
        {
          "data": result.dataFeed,
          colorByPoint: true,
          showInLegend: false
        }
      ]
    });
  })
})

$('#show-bowler-economy').click(function () {
  $.get("/player/bowler-economy", function (result) {
    // Create the chart
    Highcharts.chart('container', {
      chart: { type: 'column' },
      title: { text: 'IPL Analysis' },
      subtitle: { text: 'Economical Bowlers (Top 15 in 2015 : min 10 overs)' },
      yAxis: { title: { text: 'Runs' } },
      xAxis: {
        categories: result.names,
        title: { text: "Team" }
      },
      plotOptions: {
        series: {
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.y:.3f}'
          }
        }
      },
      "series": [
        {
          "data": result.dataFeed.slice(0, 15),
          colorByPoint: true,
          showInLegend: false
        }
      ]
    });
  })
})

$('#show-high-ind-score').click(function () {
  let batsmenHighScore = {};
  let matchData = {};

  for (const key of deliveriesJson) {
    let matchId = key.match_id;
    let batsman = key.batsman;
    let run = parseInt(key.batsman_runs);
    if (matchId in matchData) {
      if (batsman in matchData[matchId]) {
        matchData[matchId][batsman] += run;
      } else {
        matchData[matchId][batsman] = run;
      }
    } else {
      matchData[matchId] = {};
      matchData[matchId][batsman] = run;
    }
  }

  for (const key of Object.keys(matchData)) {
    let teamBatsmen = Object.keys(matchData[key]);
    for (const bat of teamBatsmen) {
      if (bat in batsmenHighScore) {
        if (batsmenHighScore[bat] < matchData[key][bat]) {
          batsmenHighScore[bat] = matchData[key][bat];
        }
      } else {
        batsmenHighScore[bat] = matchData[key][bat];
      }
    }
  }

  let sortedNames = Object.keys(batsmenHighScore).sort(function (a, b) {
    return batsmenHighScore[b] - batsmenHighScore[a];
  });
  let sortedScore = [];
  for (const i in sortedNames) {
    sortedScore[i] = batsmenHighScore[sortedNames[i]];
  }

  // Create the chart
  Highcharts.chart('container', {
    chart: { type: 'column' },
    title: { text: 'IPL Analysis' },
    subtitle: { text: 'Highest Individual Score (Top 15)' },
    yAxis: { title: { text: 'Runs' } },
    xAxis: {
      categories: sortedNames.slice(0, 15),
      title: { text: "Batsman" }
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: '{point.y:%f}'
        }
      }
    },
    "series": [
      {
        "data": sortedScore.slice(0, 15),
        colorByPoint: true,
        showInLegend: false
      }
    ]
  });
})