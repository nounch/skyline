var Plot = (function() {
  function Plot() {
    var self = this;
    self.width = 800;
    self.height = 400;
    self.margin = 50;
    self.data = [10, 2, 34, 14, 37, 20, 39, 55, 2, 22, 13];
    self.mainPlot = d3.select('body')
      .append('div')
      .attr('id', '#main-plot');
    self.svg = self.mainPlot
      .append('svg:svg')
      .attr('width', self.width + '')
      .attr('height', self.height + 'px')
      .style('background-color', '#F1F1F1');
    self.graph = self.svg.append('svg:g');
    self.xScale = d3.scale.linear()
      .domain([0, self.data.length])
      .range([self.margin, self.width - self.margin]);
    self.yScale = d3.scale.linear()
      .domain([0, d3.max(self.data)])
      .range([self.height - self.margin, self.margin]);
    self.line = d3.svg.line()
      .x(function(d, i) { return self.xScale(i); })
      .y(function(d, i) { return self.yScale(d); });
    self.path = self.graph.append('svg:path');
    self.previousPathColor = null;
    self.currentDataPoint = null;
    // x axis
    self.xAxis = d3.svg.axis()
      .scale(self.xScale)
      .orient('bottom')
      .tickSize(8, 1)
      .ticks(self.data.length);
    self.graph.append('g')
      .style({
        'stroke': '#121212',
        'font-family': 'Helvetica',
	'font-size': '12px',
        'shapeRendering': 'crispEdges',
      })
      .attr('class', 'x-axis')
      .attr('transform', 'translate(0,' + (self.height - self.margin)
	    + ')')
      .call(self.xAxis);
    // y axis
    self.yAxis = d3.svg.axis()
      .scale(self.yScale)
      .orient('left')
      .tickSize(5, 1)
      .ticks(10);
    self.graph.append('g')
      .attr('class', 'y-axis')
      .style({
        'stroke': '#121212',
        'font-family': 'Helvetica',
	'font-size': '12px',
        'shapeRendering': 'crispEdges',
      })
      .attr('transform', 'translate(' + self.margin + ', 0)')
      .call(self.yAxis);

    this.init();
  }

  Plot.prototype = new (function() {
    this.init = function() {
      d3.select('body').style('background-color', '#E3E3E3');
      this.graph.append('text')
        .attr('id', 'current-data-point')
        .style({
          'font-size': '1.9em',
          'font-family': 'Helvetica',
        })
        .attr('x', this.width - 80)
        .attr('y', 80)
        .text(this.data[this.data.length - 1]);
    };
    this.rand = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    };
    this.setInfo = function(text) {
      d3.select('#current-data-point').text(text + '');
    };
    this.plot = function() {
      var self = this;
      this.path
        .attr('d', this.line(this.data))
        .attr('fill', 'none')
        .attr('stroke', '#FF0000')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', '1px')
        .on('mouseenter', function() {
          this.previousPathColor = d3.select(this).attr('stroke');
          d3.select(this)
            .transition()
            .duration(130)
            .attr('stroke', '#00FF00');

          var that = this;
          window.setInterval(function() {
            if (self.data.length > 500) {
              delete self.data;
              self.data = [];
            }
            self.currentDataPoint = self.rand(0, 800);
            self.data.push(self.currentDataPoint);
            self.setInfo(self.currentDataPoint.toString());
            d3.select(that).attr('d', self.line(self.data));
            // Rescale x
            self.xScale = d3.scale.linear()
              .domain([0, self.data.length])
              .range([self.margin, self.width - self.margin]);
            // Rescale y
            self.yScale = d3.scale.linear()
              .domain([0, d3.max(self.data)])
              .range([self.height - self.margin, self.margin]);
            // Update the x axis
            self.xAxis.scale(self.xScale);
            d3.select('.x-axis').call(self.xAxis);
            // Update the y axis
            self.yAxis.scale(self.yScale);
            d3.select('.y-axis').call(self.yAxis);
          }, 20);

        })
        .on('mouseleave', function() {
          d3.select(this)
            .transition()
            .duration(500)
            .attr('stroke', this.previousPathColor);
        });
    };
  })();

  return Plot;
})();

var plot = new Plot();
plot.plot();
