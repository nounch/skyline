var LineChart = (function() {
  function LineChart(data, width, height, noKnobs, noZoom) {
    var self = this;
    if (Object.prototype.toString.call(data[0]) == '[object Array]') {
      self.dataSet = data;
    } else {
      self.dataSet = [data];
    }
    self.allData = [];
    for (var i = 0; i < self.dataSet.length; i++) {
      self.allData = self.allData.concat(self.dataSet[i]);
    }
    self.minX = d3.min(self.allData, function(d, i) { return d[0]; });
    self.maxX = d3.max(self.allData, function(d, i) { return d[0]; });
    self.minY = d3.min(self.allData, function(d, i) { return d[1]; });
    self.maxY = d3.max(self.allData, function(d, i) { return d[1]; });
    self.width = width || 800;
    self.height = height || 300;
    self.margin = 50;
    self.knobRadius = 5;
    self.dataPointsThreshold = 50;
    self.noKnobs = noKnobs || false;
    self.previousCursor = null;
    // x axis
    self.xScale = d3.scale.linear()
      .domain([self.minX, self.maxX])
      .range([self.margin, self.width - self.margin]);
    // y axis
    self.yScale = d3.scale.linear()
      .domain([self.minY, self.maxY])
      .range([self.height - self.margin, self.margin]);
    // Plot
    self.svg = d3.select('body').insert('svg:svg', ':first-child')
      .attr('width', self.width)
      .attr('height', self.height)
      .style({
        'background-color': '#F1F1F1',
      });
    self.graph = self.svg.append('svg:g');
    // x axis
    self.xAxis = d3.svg.axis()
      .orient('bottom')
      .scale(self.xScale)
      .tickSize(5, 1)
      .ticks(10);
    self.xAxisElement = self.svg.append('svg:g')
      .attr('class', 'line-chart-x-axis')
      .attr('transform', 'translate(0, ' + (self.height - self.margin) +
            ')')
      .call(self.xAxis);
    self.xAxisElement.selectAll('line').style({'stroke': '#121212'});
    // y axis
    self.yAxis = d3.svg.axis()
      .orient('left')
      .scale(self.yScale)
      .tickSize(5, 1)
      .ticks(10);
    self.yAxisElement = self.svg.append('svg:g')
      .attr('class', 'line-chart-y-axis')
      .attr('transform', 'translate(' + self.margin + ', 0)')
      .call(self.yAxis);
    self.yAxisElement.selectAll('line').style({'stroke': '#121212'});

    // x grid
    self.xGrid = d3.svg.axis()
      .scale(self.xScale)
      .orient('bottom')
      .tickSize(- (self.height - 2 * self.margin), 0, 0)
      .ticks(10);
    self.graph.append('g')
      .attr('class', 'axis-without-text')
      .attr('transform', 'translate(0, ' + (self.height - self.margin)  +
            ')')
      .call(self.xGrid)
      .style({
        'stroke': '#121212',
        'opacity': '0.1',
      });
    d3.selectAll('.axis-without-text .tick text').style({
      'stroke-width': '0',
      'fill': 'none',
    });
    // y grid
    self.yGrid = d3.svg.axis()
      .scale(self.yScale)
      .orient('left')
      .tickSize(- (self.width - 2 * self.margin), 0, 0)
      .ticks(10);
    self.graph.append('g')
      .attr('class', 'axis-without-text')
      .attr('transform', 'translate( ' + self.margin  + ', 0)')
      .call(self.yGrid)
      .style({
        'stroke': '#121212',
        'opacity': '0.1',
      });
    d3.selectAll('.axis-without-text .tick text').style({
      'stroke-width': '0',
      'fill': 'none',
    });

    // Tooltip
    self.tooltip = d3.select('body').append('div')
      .style({
        'top': 0,
        'left': 0,
        'background-color': '#121212',
        'color': '#F1F1F1',
        'opacity': '0.8',
        'position': 'absolute',
        'font-family': 'Helvetica',
        'padding': '5px',
        'border-radius': '5px',
        'visibility': 'hidden',
        'z-index': '99999',
      });

    // Line color
    self.lineColor = d3.scale.sqrt()
      .domain([0, self.dataSet.length])
      .range(['steelblue', 'orange'])
      .interpolate(d3.interpolateHsl);

    self.noZoom = noZoom || false;
    if (!self.noZoom) {
      self.enableZoom();
    }
  }

  LineChart.prototype = new (function() {
    this.plot = function() {
      var self = this;

      // Draw 0-line markers. if necessary.
      if (self.minX < 0) {
        self.graph.append('svg:rect')
          .attr('x', self.xScale(0) - 0.5)
          .attr('y', self.margin)
          .attr('height', self.yScale(self.minY) - self.margin)
          .attr('width', 1)
          .style({'fill': '#888888',});
      }

      if (self.minY < 0) {
        self.graph.append('svg:rect')
          .attr('x', self.xScale(self.minX))
          .attr('y', self.yScale(0) - 0.5)
          .attr('height', 1)
          .attr('width', self.xScale(self.maxX) - self.margin)
          .style({'fill': '#888888',});
      }

      self.lineStrokeWidth = self.knobRadius / 2
      self.dataSet.forEach(function(data, index) {
        // Line
        self.line = d3.svg.line()
          .x(function(d, i) { return self.xScale(d[0]); })
          .y(function(d, i) { return self.yScale(d[1]) ; });
        self.path = self.graph.append('svg:path');
        if (self.allData.length > self.dataPointsThreshold) {
          self.lineStrokeWidth = 1;
        }
        self.path
          .attr('d', self.line(data))
          .style({
            'fill': 'none',
            'stroke': self.lineColor(index),
            'stroke-width': self.lineStrokeWidth,
          })
          .on('mouseover', function() {
            // Set the cursor
            self.previousCursor = self.svg.style('cursor');
            self.svg.style({'cursor': 'default'});

            self.moveToForeground(this);
            d3.select(this)
              .transition()
              .duration(250)
              .style({'stroke-width': self.lineStrokeWidth * 2,});
          })
          .on('mouseleave', function() {
            // Reset the cursor
            self.svg.style({'cursor': self.previousCursor});

            d3.select(this)
              .transition()
              .duration(250)
              .style({'stroke-width': self.lineStrokeWidth,});
          });
        this.dataPointIdPrefix = 'line-chart-data-point-'
        // Knobs/Hover area
        if (self.allData.length < self.dataPointsThreshold &&
            !self.noKnobs) {
          var that = self;
          that.hoverBoxWidth = null;
          data.forEach(function(dat, idx) {
            // Knob
            that.graph.append('svg:circle')
              .attr('cx', that.xScale(dat[0]))
              .attr('cy', that.yScale(dat[1]))
              .attr('r', that.knobRadius)
              .style({'fill': self.lineColor(index),});
            // Hover area
            that.graph.append('svg:circle')
              .attr('cx', self.xScale(dat[0]))
              .attr('cy', self.yScale(dat[1]))
              .attr('r', self.knobRadius * 2)
              .style({
                'fill': self.lineColor(index),
                'opacity': '0.0',
              })
              .on('mouseenter', function() {
                // Set the cursor
                self.previousCursor = self.svg.style('cursor');
                self.svg.style({'cursor': 'crosshair'});

                d3.select(this)
                  .style({
                    'opacity': '0.3',
                  })
                  .transition()
                  .duration(130)
                  .attr('r', self.knobRadius * 3);
                self.tooltip
                  .text(dat[0] + ' | ' + dat[1])
                  .style({
                    'top': d3.event.pageY - 50,
                    'left': d3.event.pageX,
                    'visibility': 'visible',
                    'border': '3px solid ' + self.lineColor(index),
                    'box-shadow': '0 0 13px ' + self.lineColor(index),
                  });
              })
              .on('mouseleave', function() {
                // Reset the cursor
                self.svg.style({'cursor': self.previousCursor});

                d3.select(this)
                  .style({
                    'opacity': '0.0',
                  })
                  .transition()
                  .duration(130)
                  .attr('r', self.knobRadius * 2);
                self.tooltip.style({'visibility': 'hidden'});
              });
          });
        }
      });
    };

    this.moveToForeground = function(element) {
      element.parentNode.appendChild(element);
    };

    this.zoomed = function(self) {
      // Do not translate if the graph is fully zoomed out (else the graph
      // could be moved off the viewport and become invisible).
      if (d3.event.scale > 1) {
        self.graph
        // .transition()
        // .duration(130)
          .attr('transform', 'translate(' + d3.event.translate +
                ')scale(' + d3.event.scale + ')');
      } else {
        self.graph
          .transition()
          .duration(130)
          .attr('transform', 'scale(' + d3.event.scale + ')');
      }

      // Recenter when fully zoomed out
      if (d3.event.scale == 1) {
        self.zoom.translate([0, 0]).scale(1);
      }

      // Rescale the x/y axis
      self.xAxisElement
        .transition()
        .duration(130)
        .call(self.xAxis);
      self.yAxisElement
        .transition()
        .duration(130)
        .call(self.yAxis);
    };

    this.enableZoom = function() {
      var self = this;
      // Zoom
      self.svg.style({'cursor': 'ns-resize'});
      self.zoom = d3.behavior.zoom()
        .x(self.xScale)
        .y(self.yScale)
        .scaleExtent([1, 100])
        .on('zoom', function() {
          // Set the cursor
          self.previousCursor = self.svg.style('cursor');
          self.svg.style({'cursor': 'move'});

          self.zoomed(self);
        })
        .on('zoomend', function() {
          // Reset the cursor
          self.svg.style({'cursor': 'ns-resize'});
        }
           );
      self.svg.call(self.zoom);
    };

    this.disableZoom = function() {
      var self = this;
      self.svg.style({'cursor': 'auto'});
      self.svg.on('mousewheel.zoom', null);
      self.svg.on('wheel.zoom', null);
    };
  })();

  return LineChart;
})();
