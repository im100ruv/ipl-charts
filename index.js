let matchesJson;
getYourFile("matches.csv");

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

function getYourFile(yourFile) {
  let rawFile = new XMLHttpRequest();
  rawFile.open("GET", yourFile, true);
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


$('#show-chart').click(function () {
  // console.log(JSON.stringify(matchesJson));
  let matchPerSeason = {};
  for (let i = 0; i < matchesJson.length; i++) {
    let year = matchesJson[i].season;
    if (year in matchPerSeason) {
      matchPerSeason[year] = matchPerSeason[year] + 1;
    } else {
      matchPerSeason[year] = 1;
    }
  }
  // console.log(matchPerSeason);
  let dataFeed = [];
  let dataNames = [];
  for (const key of Object.keys(matchPerSeason)) {
    dataFeed.push({"name": key, "y": matchPerSeason[key]})
  }
  console.log(dataFeed)

  // Create the chart
  Highcharts.chart('container', {
    chart: { type: 'column' },
    title: { text: 'IPL Analysis' },
    subtitle: { text: 'Matches per Season' },
    yAxis: {
      title: {
        text: 'Matches'
      }
    },
    xAxis: { categories: Object.keys(matchPerSeason) },
    "series": [
      {
        "data": dataFeed
      }
    ]
  });
})


