(function () {
  var DATASETS = {
    monthly: [
      { month: 'Jan', desktop: 186, mobile: 80 },
      { month: 'Feb', desktop: 305, mobile: 200 },
      { month: 'Mar', desktop: 237, mobile: 120 },
      { month: 'Apr', desktop: 73, mobile: 190 },
      { month: 'May', desktop: 209, mobile: 130 },
      { month: 'Jun', desktop: 214, mobile: 140 }
    ],
    daily: [
      { date: 'Apr 1', desktop: 222, mobile: 150 },
      { date: 'Apr 5', desktop: 373, mobile: 290 },
      { date: 'Apr 10', desktop: 261, mobile: 190 },
      { date: 'Apr 15', desktop: 120, mobile: 170 },
      { date: 'Apr 20', desktop: 89, mobile: 150 },
      { date: 'Apr 25', desktop: 215, mobile: 250 },
      { date: 'Apr 30', desktop: 454, mobile: 380 }
    ],
    pie: [
      { browser: 'chrome', visitors: 275, fill: 'var(--chart-1)' },
      { browser: 'safari', visitors: 200, fill: 'var(--chart-2)' },
      { browser: 'firefox', visitors: 187, fill: 'var(--chart-3)' },
      { browser: 'edge', visitors: 173, fill: 'var(--chart-4)' },
      { browser: 'other', visitors: 90, fill: 'var(--chart-5)' }
    ]
  };

  var DEFAULT_CONFIG = {
    desktop: { label: 'Desktop', color: 'var(--chart-1)' },
    mobile: { label: 'Mobile', color: 'var(--chart-2)' },
    chrome: { label: 'Chrome', color: 'var(--chart-1)' },
    safari: { label: 'Safari', color: 'var(--chart-2)' },
    firefox: { label: 'Firefox', color: 'var(--chart-3)' },
    edge: { label: 'Edge', color: 'var(--chart-4)' },
    other: { label: 'Other', color: 'var(--chart-5)' }
  };

  function parseJson(value, fallback) {
    if (!value) return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      return fallback;
    }
  }

  function getDataset(chart) {
    var inline = parseJson(chart.getAttribute('data-chart-data'), null);
    if (inline) return inline;
    var key = chart.getAttribute('data-chart-dataset') || 'monthly';
    return DATASETS[key] ? DATASETS[key].slice() : [];
  }

  function getConfig(chart) {
    return Object.assign({}, DEFAULT_CONFIG, parseJson(chart.getAttribute('data-chart-config'), {}));
  }

  function getSeries(chart) {
    var raw = chart.getAttribute('data-chart-series');
    if (!raw) return ['desktop', 'mobile'];
    return raw.split(',').map(function (item) { return item.trim(); }).filter(Boolean);
  }

  function applyConfigVars(chart, config, series) {
    series.forEach(function (key) {
      if (config[key] && config[key].color) {
        chart.style.setProperty('--color-' + key, config[key].color);
      }
    });
  }

  function createSvgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (name) {
      el.setAttribute(name, attrs[name]);
    });
    return el;
  }

  function formatNumber(value) {
    return Number(value).toLocaleString('en-US');
  }

  function getDimensions(container, heightAttr) {
    var width = container.clientWidth || 320;
    var height = parseInt(heightAttr || '250', 10);
    return { width: width, height: height };
  }

  function getMargins(type) {
    if (type === 'pie') {
      return { top: 16, right: 16, bottom: 16, left: 16 };
    }
    return { top: 12, right: 12, bottom: 32, left: 44 };
  }

  function maxValue(data, series, xKey) {
    var max = 0;
    data.forEach(function (row) {
      series.forEach(function (key) {
        if (key !== xKey && row[key] > max) max = row[key];
      });
    });
    return max || 1;
  }

  function renderGrid(svg, plot, ticks) {
    ticks.forEach(function (tick, index) {
      if (index === 0) return;
      var y = plot.y + plot.height - (plot.height * tick / ticks[ticks.length - 1]);
      svg.appendChild(createSvgEl('line', {
        x1: String(plot.x),
        y1: String(y),
        x2: String(plot.x + plot.width),
        y2: String(y),
        class: 'chart-grid-line'
      }));
    });
  }

  function renderAxisLabels(svg, plot, data, xKey, max) {
    var step = plot.width / Math.max(data.length, 1);
    data.forEach(function (row, index) {
      var x = plot.x + step * index + step / 2;
      svg.appendChild(createSvgEl('text', {
        x: String(x),
        y: String(plot.y + plot.height + 20),
        class: 'chart-axis-tick',
        'text-anchor': 'middle'
      })).textContent = row[xKey];
    });

    var ticks = [0, max * 0.25, max * 0.5, max * 0.75, max];
    ticks.forEach(function (tick) {
      var y = plot.y + plot.height - (plot.height * tick / max);
      svg.appendChild(createSvgEl('text', {
        x: String(plot.x - 8),
        y: String(y + 4),
        class: 'chart-axis-tick',
        'text-anchor': 'end'
      })).textContent = Math.round(tick).toString();
    });

    return ticks;
  }

  function showTooltip(chart, html, x, y) {
    var tooltip = chart.querySelector('[data-slot="chart-tooltip"]');
    if (!tooltip) return;
    tooltip.innerHTML = html;
    tooltip.setAttribute('data-state', 'open');
    tooltip.removeAttribute('hidden');
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  function hideTooltip(chart) {
    var tooltip = chart.querySelector('[data-slot="chart-tooltip"]');
    if (!tooltip) return;
    tooltip.setAttribute('data-state', 'closed');
    tooltip.setAttribute('hidden', '');
  }

  function buildTooltipHtml(label, items) {
    var rows = items.map(function (item) {
      return '<div data-slot="chart-tooltip-item">' +
        '<span data-slot="chart-tooltip-indicator" style="background-color:' + item.color + '"></span>' +
        '<span class="chart-tooltip-series">' + item.label + '</span>' +
        '<span data-slot="chart-tooltip-value">' + formatNumber(item.value) + '</span>' +
        '</div>';
    }).join('');
    return '<div data-slot="chart-tooltip-label">' + label + '</div>' +
      '<div data-slot="chart-tooltip-items">' + rows + '</div>';
  }

  function bindCartesianTooltip(chart, container, svg, data, xKey, series, config, plot, type) {
    var overlay = createSvgEl('rect', {
      x: String(plot.x),
      y: String(plot.y),
      width: String(plot.width),
      height: String(plot.height),
      fill: 'transparent',
      class: 'chart-overlay'
    });

    overlay.addEventListener('mousemove', function (event) {
      var rect = svg.getBoundingClientRect();
      var relX = event.clientX - rect.left - plot.x;
      var step = plot.width / Math.max(data.length, 1);
      var index = Math.min(data.length - 1, Math.max(0, Math.floor(relX / step)));
      var row = data[index];
      var items = series.map(function (key) {
        return {
          label: (config[key] && config[key].label) || key,
          color: (config[key] && config[key].color) || 'var(--chart-1)',
          value: row[key]
        };
      });
      var containerRect = container.getBoundingClientRect();
      showTooltip(
        chart,
        buildTooltipHtml(row[xKey], items),
        event.clientX - containerRect.left + 12,
        event.clientY - containerRect.top - 12
      );
    });

    overlay.addEventListener('mouseleave', function () {
      hideTooltip(chart);
    });

    svg.appendChild(overlay);
  }

  function renderBarChart(chart, container, data, xKey, series, config, options) {
    var dims = getDimensions(container, chart.getAttribute('data-chart-height'));
    var margins = getMargins('bar');
    var plot = {
      x: margins.left,
      y: margins.top,
      width: dims.width - margins.left - margins.right,
      height: dims.height - margins.top - margins.bottom
    };
    var activeSeries = chart.getAttribute('data-chart-active-series');
    var visibleSeries = activeSeries ? [activeSeries] : series;
    var max = maxValue(data, visibleSeries, xKey);
    var svg = createSvgEl('svg', {
      viewBox: '0 0 ' + dims.width + ' ' + dims.height,
      class: 'chart-svg',
      role: 'img',
      'aria-label': chart.getAttribute('aria-label') || 'Bar chart'
    });

    if (options.grid !== false) {
      renderGrid(svg, plot, [0, max * 0.25, max * 0.5, max * 0.75, max]);
    }
    renderAxisLabels(svg, plot, data, xKey, max);

    var groupWidth = plot.width / Math.max(data.length, 1);
    var barGap = 4;
    var barWidth = (groupWidth - barGap * (visibleSeries.length + 1)) / visibleSeries.length;

    data.forEach(function (row, rowIndex) {
      visibleSeries.forEach(function (key, seriesIndex) {
        var value = row[key] || 0;
        var barHeight = (value / max) * plot.height;
        var x = plot.x + groupWidth * rowIndex + barGap + (barWidth + barGap) * seriesIndex;
        var y = plot.y + plot.height - barHeight;
        svg.appendChild(createSvgEl('rect', {
          x: String(x),
          y: String(y),
          width: String(Math.max(barWidth, 2)),
          height: String(barHeight),
          rx: '4',
          class: 'chart-bar',
          fill: (config[key] && config[key].color) || 'var(--chart-1)',
          'data-series': key,
          'data-index': String(rowIndex)
        }));
      });
    });

    if (options.tooltip !== false) {
      bindCartesianTooltip(chart, container, svg, data, xKey, visibleSeries, config, plot, 'bar');
    }

    container.replaceChildren(svg);
  }

  function buildLinearPath(points) {
    if (!points.length) return '';
    return points.map(function (point, index) {
      return (index === 0 ? 'M' : 'L') + point.x + ' ' + point.y;
    }).join(' ');
  }

  function buildSmoothPath(points) {
    if (points.length < 2) {
      return points.length ? 'M ' + points[0].x + ' ' + points[0].y : '';
    }

    var path = ['M', points[0].x, points[0].y];
    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[i === 0 ? 0 : i - 1];
      var p1 = points[i];
      var p2 = points[i + 1];
      var p3 = points[i + 2] || p2;
      var cp1x = p1.x + (p2.x - p0.x) / 6;
      var cp1y = p1.y + (p2.y - p0.y) / 6;
      var cp2x = p2.x - (p3.x - p1.x) / 6;
      var cp2y = p2.y - (p3.y - p1.y) / 6;
      path.push('C', cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }
    return path.join(' ');
  }

  function buildStrokePath(points, smooth) {
    return smooth ? buildSmoothPath(points) : buildLinearPath(points);
  }

  function buildClosedAreaPath(points, plot, smooth) {
    var baseline = plot.y + plot.height;
    var topPath = buildStrokePath(points, smooth);
    if (!points.length) return '';
    return topPath +
      ' L ' + points[points.length - 1].x + ' ' + baseline +
      ' L ' + points[0].x + ' ' + baseline + ' Z';
  }

  function ensureChartUid(chart) {
    if (!chart.dataset.chartUid) {
      chart.dataset.chartUid = 'chart-' + Math.random().toString(36).slice(2, 9);
    }
    return chart.dataset.chartUid;
  }

  function appendAreaGradient(svg, chart, key, color, plot) {
    var gradId = ensureChartUid(chart) + '-area-' + key;
    var defs = createSvgEl('defs', {});
    var gradient = createSvgEl('linearGradient', {
      id: gradId,
      gradientUnits: 'userSpaceOnUse',
      x1: '0',
      y1: String(plot.y),
      x2: '0',
      y2: String(plot.y + plot.height)
    });
    gradient.appendChild(createSvgEl('stop', {
      offset: '5%',
      'stop-color': color,
      'stop-opacity': '0.55'
    }));
    gradient.appendChild(createSvgEl('stop', {
      offset: '95%',
      'stop-color': color,
      'stop-opacity': '0'
    }));
    defs.appendChild(gradient);
    svg.appendChild(defs);
    return 'url(#' + gradId + ')';
  }

  function renderLineAreaChart(chart, container, data, xKey, series, config, options, filled) {
    var dims = getDimensions(container, chart.getAttribute('data-chart-height'));
    var margins = getMargins('line');
    var plot = {
      x: margins.left,
      y: margins.top,
      width: dims.width - margins.left - margins.right,
      height: dims.height - margins.top - margins.bottom
    };
    var max = maxValue(data, series, xKey);
    var svg = createSvgEl('svg', {
      viewBox: '0 0 ' + dims.width + ' ' + dims.height,
      class: 'chart-svg',
      role: 'img',
      'aria-label': chart.getAttribute('aria-label') || (filled ? 'Area chart' : 'Line chart')
    });

    if (options.grid !== false) {
      renderGrid(svg, plot, [0, max * 0.25, max * 0.5, max * 0.75, max]);
    }
    renderAxisLabels(svg, plot, data, xKey, max);

    var stepX = plot.width / Math.max(data.length - 1, 1);
    var smooth = options.curve === true;
    var gradient = filled && options.gradient === true;

    series.forEach(function (key) {
      var color = (config[key] && config[key].color) || 'var(--chart-1)';
      var points = data.map(function (row, index) {
        var x = plot.x + stepX * index;
        var y = plot.y + plot.height - ((row[key] || 0) / max) * plot.height;
        return { x: x, y: y };
      });

      if (filled) {
        var areaFill = gradient ? appendAreaGradient(svg, chart, key, color, plot) : color;
        svg.appendChild(createSvgEl('path', {
          d: buildClosedAreaPath(points, plot, smooth),
          class: 'chart-area' + (gradient ? ' chart-area-gradient' : ''),
          fill: areaFill,
          opacity: gradient ? '1' : '0.25'
        }));
      }

      svg.appendChild(createSvgEl('path', {
        d: buildStrokePath(points, smooth),
        class: filled ? 'chart-area-line' : 'chart-line',
        fill: 'none',
        stroke: color,
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }));

      if (!filled || !smooth) {
        points.forEach(function (point) {
          svg.appendChild(createSvgEl('circle', {
            cx: String(point.x),
            cy: String(point.y),
            r: '3',
            class: 'chart-dot',
            fill: color
          }));
        });
      }
    });

    if (options.tooltip !== false) {
      bindCartesianTooltip(chart, container, svg, data, xKey, series, config, plot, filled ? 'area' : 'line');
    }

    container.replaceChildren(svg);
  }

  function polarToCartesian(cx, cy, radius, angle) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  }

  function describeArc(cx, cy, radius, startAngle, endAngle) {
    return describeRingSlice(cx, cy, radius, 0, startAngle, endAngle);
  }

  function describeRingSlice(cx, cy, outerR, innerR, startAngle, endAngle) {
    var largeArc = endAngle - startAngle <= Math.PI ? '0' : '1';

    if (!innerR || innerR <= 0) {
      var start = polarToCartesian(cx, cy, outerR, endAngle);
      var end = polarToCartesian(cx, cy, outerR, startAngle);
      return [
        'M', cx, cy,
        'L', start.x, start.y,
        'A', outerR, outerR, 0, largeArc, 0, end.x, end.y,
        'Z'
      ].join(' ');
    }

    var outerStart = polarToCartesian(cx, cy, outerR, startAngle);
    var outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
    var innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
    var innerStart = polarToCartesian(cx, cy, innerR, startAngle);

    return [
      'M', outerStart.x, outerStart.y,
      'A', outerR, outerR, 0, largeArc, 1, outerEnd.x, outerEnd.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerR, innerR, 0, largeArc, 0, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  }

  function renderDonutCenter(container, chart, total) {
    var existing = container.querySelector('[data-slot="chart-donut-center"]');
    if (existing) existing.remove();

    var center = document.createElement('div');
    center.setAttribute('data-slot', 'chart-donut-center');
    var label = chart.getAttribute('data-chart-center-label') || 'Total';
    center.innerHTML =
      '<span data-slot="chart-donut-center-label">' + label + '</span>' +
      '<span data-slot="chart-donut-center-value">' + formatNumber(total) + '</span>';
    container.appendChild(center);
  }

  function renderRadialChart(chart, container, data, labelKey, valueKey, config, options, innerRadiusRatio) {
    var isDonut = innerRadiusRatio > 0;
    var dims = getDimensions(container, chart.getAttribute('data-chart-height'));
    var svg = createSvgEl('svg', {
      viewBox: '0 0 ' + dims.width + ' ' + dims.height,
      class: 'chart-svg',
      role: 'img',
      'aria-label': chart.getAttribute('aria-label') || (isDonut ? 'Donut chart' : 'Pie chart')
    });
    var cx = dims.width / 2;
    var cy = dims.height / 2;
    var outerRadius = Math.min(dims.width, dims.height) / 2 - 24;
    var innerRadius = isDonut ? outerRadius * innerRadiusRatio : 0;
    var total = data.reduce(function (sum, row) { return sum + (row[valueKey] || 0); }, 0) || 1;
    var cursor = -Math.PI / 2;
    var gap = parseFloat(chart.getAttribute('data-chart-slice-gap') || (isDonut ? '0.02' : '0'));

    data.forEach(function (row) {
      var value = row[valueKey] || 0;
      var slice = (value / total) * Math.PI * 2;
      var sliceGap = gap > 0 ? Math.min(gap, slice * 0.25) : 0;
      var startAngle = cursor + sliceGap / 2;
      var endAngle = cursor + slice - sliceGap / 2;
      var color = row.fill || (config[row[labelKey]] && config[row[labelKey]].color) || 'var(--chart-1)';
      var path = createSvgEl('path', {
        d: describeRingSlice(cx, cy, outerRadius, innerRadius, startAngle, endAngle),
        fill: color,
        class: 'chart-pie-slice' + (isDonut ? ' chart-donut-slice' : '')
      });
      path.addEventListener('mousemove', function (event) {
        var containerRect = container.getBoundingClientRect();
        showTooltip(
          chart,
          buildTooltipHtml((config[row[labelKey]] && config[row[labelKey]].label) || row[labelKey], [{
            label: (config[row[labelKey]] && config[row[labelKey]].label) || row[labelKey],
            color: color,
            value: value
          }]),
          event.clientX - containerRect.left + 12,
          event.clientY - containerRect.top - 12
        );
      });
      path.addEventListener('mouseleave', function () { hideTooltip(chart); });
      svg.appendChild(path);
      cursor += slice;
    });

    container.replaceChildren(svg);
    if (isDonut) renderDonutCenter(container, chart, total);
  }

  function renderPieChart(chart, container, data, labelKey, valueKey, config, options) {
    renderRadialChart(chart, container, data, labelKey, valueKey, config, options, 0);
  }

  function renderDonutChart(chart, container, data, labelKey, valueKey, config, options) {
    var innerRatio = parseFloat(chart.getAttribute('data-chart-inner-radius') || '0.58');
    renderRadialChart(chart, container, data, labelKey, valueKey, config, options, innerRatio);
  }

  function renderLegend(chart, series, config) {
    var legend = chart.querySelector('[data-slot="chart-legend"]');
    if (!legend || chart.getAttribute('data-chart-legend') === 'false') return;
    legend.replaceChildren();
    series.forEach(function (key) {
      var item = document.createElement('div');
      item.setAttribute('data-slot', 'chart-legend-item');
      var color = (config[key] && config[key].color) || 'var(--chart-1)';
      item.innerHTML = '<span data-slot="chart-legend-indicator" style="background-color:' + color + '"></span>' +
        '<span>' + ((config[key] && config[key].label) || key) + '</span>';
      legend.appendChild(item);
    });
  }

  function renderChart(chart) {
    var container = chart.querySelector('[data-slot="chart-container"]');
    if (!container) return;

    var height = chart.getAttribute('data-chart-height') || '250';
    container.style.minHeight = height + 'px';

    var type = chart.getAttribute('data-chart-type') || 'bar';
    var data = getDataset(chart);
    var config = getConfig(chart);
    var xKey = chart.getAttribute('data-chart-x') || 'month';
    var series = getSeries(chart);
    var options = {
      grid: chart.getAttribute('data-chart-grid') !== 'false',
      tooltip: chart.getAttribute('data-chart-tooltip') !== 'false',
      curve: chart.getAttribute('data-chart-curve') === 'true',
      gradient: chart.getAttribute('data-chart-gradient') === 'true'
    };

    applyConfigVars(chart, config, series);

    if (type === 'pie') {
      renderPieChart(chart, container, data, xKey, chart.getAttribute('data-chart-value') || 'visitors', config, options);
      renderLegend(chart, data.map(function (row) { return row[xKey]; }), config);
      return;
    }

    if (type === 'donut') {
      renderDonutChart(chart, container, data, xKey, chart.getAttribute('data-chart-value') || 'visitors', config, options);
      renderLegend(chart, data.map(function (row) { return row[xKey]; }), config);
      return;
    }

    if (type === 'line') {
      renderLineAreaChart(chart, container, data, xKey, series, config, options, false);
    } else if (type === 'area') {
      renderLineAreaChart(chart, container, data, xKey, series, config, options, true);
    } else {
      renderBarChart(chart, container, data, xKey, series, config, options);
    }

    renderLegend(chart, series, config);
  }

  function bindInteractive(chart) {
    var root = chart.closest('[data-chart-interactive]');
    if (!root) return;

    root.querySelectorAll('[data-chart-toggle]').forEach(function (button) {
      if (button.dataset.chartToggleBound === 'true') return;
      button.dataset.chartToggleBound = 'true';

      button.addEventListener('click', function () {
        var series = button.getAttribute('data-chart-toggle');
        chart.setAttribute('data-chart-active-series', series);
        root.querySelectorAll('[data-chart-toggle]').forEach(function (item) {
          item.removeAttribute('data-active');
        });
        button.setAttribute('data-active', 'true');
        renderChart(chart);
      });
    });
  }

  function initCharts(root) {
    (root || document).querySelectorAll('[data-slot="chart"]').forEach(function (chart) {
      if (chart.dataset.chartBound === 'true') return;
      chart.dataset.chartBound = 'true';

      var container = chart.querySelector('[data-slot="chart-container"]');
      renderChart(chart);
      bindInteractive(chart);

      if (container && typeof ResizeObserver !== 'undefined') {
        var observer = new ResizeObserver(function () {
          renderChart(chart);
        });
        observer.observe(container);
        chart._chartObserver = observer;
      }
    });
  }

  window.initCharts = initCharts;
})();
