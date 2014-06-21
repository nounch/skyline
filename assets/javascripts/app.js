// Data

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

// var lineChart = new SkyLine(data, 1200, 500);


//=========================================================================
// Use case: multiple plots
//=========================================================================

var margin = 50;

var lineChart = new SkyLine('#line-chart', {
  data: data,
  width: 900,
  height: 400,
  // knobs: true,
  zoom: true,
  scatter: false,

  // Non-essentials

  // knobRadius: 10,

  // threshold: 3,

  // tooltip: {
  //   'background-color': '#FF0000',
  //   'color': '#0000FF',
  //   'box-shadow': '0 0 0 #000',
  //   'border': 'none',
  //   'font-size': '2.2em',
  //   'margin-top': '-30px',
  // }

  // prepend: true,
});

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

lineChart.plot();
