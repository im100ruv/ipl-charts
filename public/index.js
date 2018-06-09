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
        name: yTitle,
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
  $('#show-mat-per-seas').click(function () {
    $.get("/match/mat-per-season", function (result) {
      let years = result.map(function (obj) {
        return obj.name;
      });
      createChart(years, result, "Year", "Matches", 'Matches per Season');
    });
  })

  $('#show-won-stack').click(function () {
    $.get("/match/won-stack", function (result) {
      createStackChart(result.teamNames, result.dataFeed, "Teams", "Matches Won", "Matches won per year");
    });
  })

  $('#show-extra-runs').click(function () {
    $.get("/match/extra-runs", function (result) {
      createChart(result.teams, result.dataFeed, "Team", "Runs", "Extras per Team (in 2016)");
    })
  })

  $('#show-bowler-economy').click(function () {
    $.get("/player/bowler-economy", function (result) {
      createChart(result.names, result.dataFeed, "Bowlers", "Economy", "Economical Bowlers (Top 15 in 2015 : min 10 overs)", '{point.y:.2f}');
    })
  })

  $('#show-high-ind-score').click(function () {
    $.get("/player/batsman-high", function (result) {
      createChart(result.names.slice(0, 15), result.dataFeed.slice(0, 15), "Batsman", "Runs", "Highest Individual Score (Top 15)");
    })
  })
});