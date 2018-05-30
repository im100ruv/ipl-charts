// $(function () {
//   let myChart = Highcharts.chart('container', {
//     chart: {
//       type: 'bar'
//     },
//     title: {
//       text: 'Fruit Consumption'
//     },
//     xAxis: {
//       categories: ['Apples', 'Bananas', 'Oranges']
//     },
//     yAxis: {
//       title: {
//         text: 'Fruit eaten'
//       }
//     },
//     series: [{
//       name: 'Jane',
//       data: [1, 0, 4]
//     }, {
//       name: 'John',
//       data: [5, 7, 3]
//     }]
//   });
// });

$(document).ready(function() {
  let chart = new Highcharts.Chart(options);
});

// var chart1; // globally available
// $(function () {
//   chart1 = Highcharts.stockChart('container', {
//     rangeSelector: {
//       selected: 1
//     },
//     series: [{
//       name: 'USD to EUR',
//       data: usdtoeur // predefined JavaScript array
//     }]
//   });
// });



function toJson(csvData) {
  let lines = csvData.split("\n");
  let colNames = lines[0].split(",");
  colNames = colNames.map(function (h) {
    return h.trim();
  });
  let records = [];
  for (let i = 1; i < lines.length; i++) {
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
        let result = toJson(allText);
        console.log(JSON.stringify(result));
        return JSON.stringify(result);
      }
    }
  }
  rawFile.send(null);
};

const matchesJson = getYourFile("matches.csv");

let options = {
  chart: {
      renderTo: 'container',
      type: 'bar'
  },
  series: [{
      name: 'Jane',
      data: [1, 2, 4]
  }]
};