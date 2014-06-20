// Data

// var data = [
//   10, 2, 34, 14, 37, 20, 39, 55, 2, 22, 13, 29, 2, 302, 33, 51, 52,
//   5, 10, 2, 34, 14, 37, 20, 39, 55, 2, 22, 13, 29, 2, 302, 33, 51, 52,
//   10, 2, 34, 14, 37, 20, 39, 55, 2, 22, 13, 29, 2, 302, 33, 51, 52,
//   5, 10, 2, 34, 14, 37, 20, 39, 55, 2, 22, 13, 29, 2, 302, 33, 51, 52,
// ];

var data = [
  [
    [1, 3],
    [2, 4],
    [3, 22],
    [4, 12],
    [5, 80],
    [6, 43],
  ],
  [
    [0, 2],
    [1, 22],
    [2, 4],
    [5, 44],
    [10.8, 3],
    [15, 25.3],
    [20, 55],
  ],
  [
    [1, 15],
    [2, 4],
    [10, 3],
    [11, 3],
    [20, 55],
  ],
  [
    [1, 15],
    [22, 44],
    [51, 3],
    [63, 33],
    [83, 5],
  ],
  [
    [1, 15],
    [3, 14],
    [11, 43],
    [34, 33],
    [43, 35],
  ],
  [
    [-11, 43],
    [40, -33],
    [53, 35],
  ],
];

//=========================================================================
// Use case: single plot
//=========================================================================

// var lineChart = new LineChart(data, 1200, 500);


//=========================================================================
// Use case: multiple plots
//=========================================================================

var margin = 50;

var lineChart = new LineChart(data, window.innerWidth - margin,
                              window.innerHeight - margin,
                              false, true, false);

var doZoom = true;
document.getElementById('zoom-toggle').onclick = function() {
  if (doZoom) {
    lineChart.enableZoom();
    doZoom = false;
  } else {
    lineChart.disableZoom();
    doZoom = true;
  }
};

// for (var i = 0; i < 10; i++) {
//   var lineChart = new LineChart(data, window.innerWidth - margin - i * 10,
//                                 window.innerHeight - margin - i * 10,
//                              // false, function() { return doZoom; });
//                              false, true);
//   lineChart.plot();
// }

lineChart.plot();
