//=========================================================================
// Use case: single plot
//=========================================================================

// var lineChart = new LineChart(data, 1200, 500);


//=========================================================================
// Use case: multiple plots
//=========================================================================

var margin = 50;
for (var i = 0; i < 10; i++) {
  var lineChart = new LineChart(data, window.innerWidth - margin - i * 10,
                                window.innerHeight - margin - i * 10);
  lineChart.plot();
}
