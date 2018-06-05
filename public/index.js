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
          "data": result.dataFeed,
          colorByPoint: true,
          showInLegend: false
        }
      ]
    });
  })
})

$('#show-high-ind-score').click(function () {
  $.get("/player/batsman-high", function (result) {
    // Create the chart
    Highcharts.chart('container', {
      chart: { type: 'column' },
      title: { text: 'IPL Analysis' },
      subtitle: { text: 'Highest Individual Score (Top 15)' },
      yAxis: { title: { text: 'Runs' } },
      xAxis: {
        categories: result.names.slice(0, 15),
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
          "data": result.dataFeed.slice(0, 15),
          colorByPoint: true,
          showInLegend: false
        }
      ]
    });
  })
})