// SkyLine - D3.js-based, zoomable multi-line plotting component
// v0.1.2


var SkyLine = (function() {
  // Options:
  //
  //  Essentials:
  //   - `data'
  //   - `width'
  //   - `height'
  //   - `knobs'
  //   - `zoom'
  //   - `scatter'
  //
  //  Customization
  //   - `knobRadius'
  //   - `threshold'
  //   - `tooltip'
  function SkyLine(selector, options) {
    var self = this;
    if (Object.prototype.toString.call(options['data'][0]) ==
        '[object Array]') {
      self.dataSet = options['data'];
    } else {
      self.dataSet = [options['data']];
    }
    self.allData = [];
    for (var i = 0; i < self.dataSet.length; i++) {
      self.allData = self.allData.concat(self.dataSet[i]);
    }
    self.minX = d3.min(self.allData, function(d, i) { return d[0]; });
    self.maxX = d3.max(self.allData, function(d, i) { return d[0]; });
    self.minY = d3.min(self.allData, function(d, i) { return d[1]; });
    self.maxY = d3.max(self.allData, function(d, i) { return d[1]; });
    self.width = options['width'] || 800;
    self.height = options['height'] || 300;
    self.margin = 50;
    self.knobRadius = options['knobRadius'] || 5;
    self.dataPointsThreshold = options['threshold'] || 50;
    self.useKnobs = options['knobs'] || true;
    options['knobs'] == false ? self.useKnobs = false : null;
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
    self.prepend = options['prepend'] || false;
    if (self.prepend) {
      // Prepend to the element.
      self.svg = d3.select(selector).insert('svg:svg', ':first-child')
    } else {
      // Append to the element.
      self.svg = d3.select(selector).append('svg:svg');
    }
    self.svg
      .attr('width', self.width)
      .attr('height', self.height);
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
    self.tooltip = self.svg.append('svg:text')
      .style({
        'font-size': '12pt',
        'font-family': 'Helvetica',
      });
    // Include user-defined style rules with heigher precedence.
    self.tooltipStyle = options['tooltip'];
    self.tooltip.style(self.tooltipStyle);

    // Line color
    self.lineColor = d3.scale.sqrt()
      .domain([0, self.dataSet.length])
      .range(['steelblue', 'orange'])
      .interpolate(d3.interpolateHsl);

    self.noZoom = !options['zoom'] || false;
    if (!self.noZoom) {
      self.enableZoom();
    }

    // Scatter plot
    self.scatter = options['scatter'] || false;
  }

  SkyLine.prototype = new (function() {
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
        if (!self.scatter) {
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
              'stroke-linejoin': 'round',
              'stroke-linecap': 'round',
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
        }
        this.dataPointIdPrefix = 'line-chart-data-point-'
        // Knobs/Hover area
        if ((self.allData.length < self.dataPointsThreshold &&
             self.useKnobs) || self.scatter) {
          var that = self;
          that.hoverBoxWidth = null;
          var circleRadius = null;
          if (self.scatter &&
              self.allData.length > self.dataPointsThreshold) {
            circleRadius = 2;
          } else {
            circleRadius = that.knobRadius;
          }
          data.forEach(function(dat, idx) {
            // Knob
            that.graph.append('svg:circle')
              .attr('cx', that.xScale(dat[0]))
              .attr('cy', that.yScale(dat[1]))
              .attr('r', circleRadius)
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
                  .attr('x', d3.mouse(this)[0])
                  .attr('y', d3.mouse(this)[1] - 25)
                  .style({'visibility': 'visible'});
                // Include user-defined style rules with heigher
                // precedence.
                self.tooltip.style(self.tooltipStyle);
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

  return SkyLine;
})();
