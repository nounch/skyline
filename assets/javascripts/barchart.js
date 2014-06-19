var BarChart = (function() {
  function BarChart(data, width, height) {
    var self = this;
    self.width = width || 800;
    self.height = height || 300;
    self.margin = 50;
    self.data = data;
    self.mainPlot = d3.select('body').append('div')
      .attr('id', '#box-plot');
    self.svg = self.mainPlot.append('svg:svg')
      .attr('width', self.width)
      .attr('height', self.height)
      .style('background-color', '#F1F1F1');
    self.graph = self.svg.append('svg:g');
    self.xScale = d3.scale.linear()
      .domain([0, self.data.length])
      .range([self.margin, self.width - self.margin]);
    self.yScale = d3.scale.linear()
      .domain([0, d3.max(self.data)])
      .range([self.height - self.margin, self.margin]);
    // x axis
    self.xAxis = d3.svg.axis()
      .scale(self.xScale)
      .orient('bottom')
      .tickSize(5, 1)
      .ticks(10);
    self.graph.append('g')
      .attr('transform', 'translate(0, ' + (self.height - self.margin) +
            ')')
      .call(self.xAxis);
    d3.selectAll('.tick line').style({
      'stroke': '#121212',
    });
    // x grid
    self.xGrid = d3.svg.axis()
      .scale(self.xScale)
      .orient('bottom')
      .tickSize(- (self.height - 2 * self.margin), 0, 0)
      .ticks(10);
    self.graph.append('g')
      .attr('id', 'bar-chart-x-axis')
      .attr('transform', 'translate(0, ' + (self.height - self.margin)  +
            ')')
      .call(self.xGrid);
    d3.selectAll('#bar-chart-x-axis .tick').style({
      'stroke': '#121212',
      'opacity': '0.1',
    });
    d3.selectAll('#bar-chart-x-axis .tick text').style({
      'stroke-width': '0',
      'fill': 'none',
    });

    // y axis
    self.yAxis = d3.svg.axis()
      .scale(self.yScale)
      .orient('left')
      .tickSize(5, 1)
      .ticks(10);
    self.graph.append('g')
      .attr('transform', 'translate(' + self.margin + ', 0)')
      .call(self.yAxis);
    d3.selectAll('.tick line').style({
      'stroke': '#121212',
    });
    // y grid
    self.yGrid = d3.svg.axis()
      .scale(self.yScale)
      .orient('left')
      .tickSize(- (self.width - 2 * self.margin), 0, 0)
      .ticks(10);
    self.graph.append('g')
      .attr('id', 'bar-chart-y-axis')
      .attr('transform', 'translate( ' + self.margin  + ', 0)')
      .call(self.yGrid);
    d3.selectAll('#bar-chart-y-axis .tick').style({
      'stroke': '#121212',
      'opacity': '0.1',
    });
    d3.selectAll('#bar-chart-y-axis .tick text').style({
      'stroke-width': '0',
      'fill': 'none',
    });

    // Tooltip
    self.tooltipHeight = 20,
    self.tooltip = d3.select('body').append('div')
      .attr('class', 'bar-chart-tooltip')
      .text('foo')
      .attr('x', 50)
      .attr('y', 50)
      .style({
        'background-color': 'rgba(0, 0, 0, 0.8)',
        'padding': '5px',
        'height': self.tooltipHeight,
        'border-radius': '2px',
        'color': '#F1F1F1',
        'position': 'absolute',
        'display': 'none',
      });
  }

  BarChart.prototype = new (function() {
    this.plot = function() {
      var that = this;
      this.data.forEach(function(dat, idx) {
        that.graph.append('svg:rect')
          .attr('x', function(d, i) { return that.xScale(idx); })
          .attr('y', function(d, i) { return that.yScale(dat); })
          .attr('width', function(d, i) { return that.width /
                                          that.data.length / 2})
          .attr('height', function(d, i) {
            return that.height - that.yScale(dat) - that.margin;
          })
          .style({'fill': 'steelblue'})

        // Position the tooltip
        that.graph.append('rect')
          .attr('x', function(d, i) { return that.xScale(idx); })
          .attr('y', function(d, i) { return that.margin; })
          .attr('width', function(d, i) { return that.width /
                                          that.data.length / 2; })
          .attr('height', function(d, i) { return that.height -
                                           2 * that.margin; })
          .style({
            'fill': '#121212',
            'opacity': '0',
          })
          .on('mouseenter', function() {
            d3.select(this).style({'opacity': '0.1'})
            that.tooltip
              .text(dat)
              .style({
                'top': d3.event.pageY - that.tooltipHeight - 30,
                'left': d3.mouse(this)[0],
                'display': 'inline',
              });
          })
          .on('mouseleave', function() {
            d3.select(this).style({'opacity': '0'})
            that.tooltip.style({'display': 'none'});
          });
      });
    };
  })();

  return BarChart;
})();

var data = [
  10, 2, 34, 14, 37, 20, 39, 55, 2, 22, 13, 29, 2, 302, 33, 51, 52,
  5, 10, 2, 34, 14, 37, 20, 39, 55, 2, 22, 13, 29, 2, 302, 33, 51, 52,
  5, 10, 2, 34, 14, 37, 20, 39, 55, 2, 22, 13, 29, 2, 302, 33, 51, 52,
  5, 10, 2, 34, 14, 37, 20, 39, 55, 2, 22, 13, 29, 2, 302, 33, 51, 52,
  5
];
var barChart = new BarChart(data);
barChart.plot();
