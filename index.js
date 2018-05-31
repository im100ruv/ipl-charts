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
  rawFile.open("GET", 'matches.csv', true);
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
  rawFile.open("GET", 'deliveries.csv', true);
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
  let matchPerSeason = {};
  for (let i = 0; i < matchesJson.length; i++) {
    let year = matchesJson[i].season;
    if (year in matchPerSeason) {
      matchPerSeason[year] = matchPerSeason[year] + 1;
    } else {
      matchPerSeason[year] = 1;
    }
  }
  let dataFeed = [];
  for (const key of Object.keys(matchPerSeason)) {
    dataFeed.push({ "name": key, "y": matchPerSeason[key] })
  }

  // Create the chart
  Highcharts.chart('container', {
    chart: { type: 'column' },
    title: { text: 'IPL Analysis' },
    subtitle: { text: 'Matches per Season' },
    yAxis: { title: { text: 'Matches' } },
    xAxis: {
       categories: Object.keys(matchPerSeason),
       title: { text: "Year"}
    },
    "series": [
      {
        "data": dataFeed,
        colorByPoint: true,
        showInLegend: false
      }
    ]
  });
})

$('#show-won-stack').click(function () {
  let matchesWonPerSeason = {};
  for (let i = 0; i < matchesJson.length; i++) {
    let winner = matchesJson[i].winner;
    if (winner == "Rising Pune Supergiants") {
      winner = "Rising Pune Supergiant"
    }
    if (winner == "") {
      winner = "No Result"
    }
    let year = matchesJson[i].season;
    if (year in matchesWonPerSeason) {
      if (matchesWonPerSeason[year][winner]) {
        matchesWonPerSeason[year][winner] = matchesWonPerSeason[year][winner] + 1;
      } else {
        matchesWonPerSeason[year][winner] = 1;
      }
    } else {
      matchesWonPerSeason[year] = {};
      matchesWonPerSeason[year][winner] = 1;
    }
  }
  let dataFeed = [];
  let years = Object.keys(matchesWonPerSeason);
  let dataTeamNames = [];
  for (const key of years) {
    for (const subkey of Object.keys(matchesWonPerSeason[key])) {
      if (!dataTeamNames.includes(subkey)) {
        dataTeamNames.push(subkey);
      }
    }
  }
  for (let i = 0; i < years.length; i++) {
    dataFeed.push({ "name": years[i], "data": [] });
    for (let j = 0; j < dataTeamNames.length; j++) {
      let team = dataTeamNames[j];
      if (matchesWonPerSeason[years[i]][team]) {
        dataFeed[i]["data"].push(matchesWonPerSeason[years[i]][team]);
      } else {
        dataFeed[i]["data"].push(0);
      }
    }
  }
  Highcharts.chart('container', {
    chart: { type: 'column' },
    title: { text: 'IPL Analysis' },
    subtitle: { text: 'Matches won per year' },
    xAxis: {
      categories: dataTeamNames
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
    series: dataFeed
  });

})

$('#show-extra-runs').click(function () {
  let extraRunsPerTeam = {};
  let matchNoStart16;
  let matchNoEnd16;
  let yearDeliveriesData = [];
  let sum = 0;
  let matchPerSeason = {};
  
  for (let i = 0; i < matchesJson.length; i++) {
    let year = matchesJson[i].season;
    if (year in matchPerSeason) {
      matchPerSeason[year] = matchPerSeason[year] + 1;
    } else {
      matchPerSeason[year] = 1;
    }
  }

  for (const yr of Object.keys(matchPerSeason)) {
    if (yr <= 2016) {
      sum += matchPerSeason[yr];  
    }
  }
  //since last season(2017) is at the top, Add 2017 matches to sum
  // replace 2017 with current season for other times
  sum += matchPerSeason[2017];
  matchNoEnd16 = sum;
  matchNoStart16 = sum - matchPerSeason[2016] + 1;
  
  for (const key of Object.keys(deliveriesJson)) {
    if((deliveriesJson[key]["match_id"] >= matchNoStart16) && (deliveriesJson[key]["match_id"] <= matchNoEnd16)){
      yearDeliveriesData.push(deliveriesJson[key]);
    }
  }
  //feed into extraRunsPerTeam
  for (const index in yearDeliveriesData) {
    let bowlingTeam = yearDeliveriesData[index]["bowling_team"];
    let extraRuns = parseInt(yearDeliveriesData[index]["extra_runs"]);
    if (bowlingTeam in extraRunsPerTeam) {
      extraRunsPerTeam[bowlingTeam] = extraRunsPerTeam[bowlingTeam] + extraRuns;
    } else {
      extraRunsPerTeam[bowlingTeam] = extraRuns;
    }
  }

  let dataFeed = [];
  for (const key of Object.keys(extraRunsPerTeam)) {
    dataFeed.push({ "name": key, "y": extraRunsPerTeam[key] })
  }

  // Create the chart
  Highcharts.chart('container', {
    chart: { type: 'column' },
    title: { text: 'IPL Analysis' },
    subtitle: { text: 'Extras per Team' },
    yAxis: { title: { text: 'Runs' } },
    xAxis: {
       categories: Object.keys(extraRunsPerTeam),
       title: { text: "Team"}
    },
    "series": [
      {
        "data": dataFeed,
        colorByPoint: true,
        showInLegend: false
      }
    ]
  });
})
