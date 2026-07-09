import ko from 'knockout'
import * as d3 from 'd3'

function bitCounter (bits) {
  let counted = 0
  for (let b = 0; b < bits.length; b++) {
    if (bits[b] === '1') {
      counted++
    }
  }
  return counted
}

function calculateColor (bits) {
  const passed = bitCounter(bits)
  const failed = bits.length - passed

  if (passed === bits.length) {
    return '#7BB209'
  } else if (failed === bits.length) {
    return '#FF3D19'
  } else if (failed === 1) {
    return '#95B90A'
  } else if (failed === 2) {
    return '#C9C40D'
  } else if (failed < 5) {
    return '#E77F13'
  } else {
    return '#FF3D19'
  }
}

function renderTreemap (data, target) {
  const w = 400
  const h = 400

  const treemap = d3.treemap()
    .round(false)
    .size([w, h])
  const hierarchy = d3.hierarchy(data, d => d.children).sum(d => d.size)
  const tree = treemap(hierarchy)
  const nodes = tree.leaves().filter(d => d.data.size)

  const svg = d3.select(target)
    .append('svg:svg')
    .attr('width', w)
    .attr('height', h)
    .append('svg:g')

  const cell = svg.selectAll('g')
    .data(nodes)
    .enter().append('svg:g')
    .attr('class', function (d) {
      return 'cell'
    })
    .attr('transform', function (d) {
      return `translate(${d.x0}, ${d.y0})`
    })

  cell.append('svg:rect')
    .attr('width', function (d) {
      return Math.max(0, d.x1 - d.x0 - 1)
    })
    .attr('height', function (d) {
      return Math.max(0, d.y1 - d.y0 - 1)
    })
    .attr('class', '')
    .attr('id', function (d) {
      return d.data.name
    })
    .text(function (d) {
      return d.children ? null : d.data.name
    })
    .style('fill', function (d) {
      return calculateColor(d.data.name)
    })
    .on('mouseover', function () {
      d3.select(this).classed('selected', true)
    })
    .on('mouseout', function () {
      d3.select(this).classed('selected', false)
    })
}

ko.bindingHandlers.populationTreemap = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    return { controlsDescendantBindings: true }
  },
  update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    const va = ko.unwrap(valueAccessor())
    const data = JSON.parse(va.data)
    d3.select(element).selectAll('svg').remove()
    renderTreemap(data, element)
    const afterRender = allBindingsAccessor.get('populationTreemapAfterRender')
    if (afterRender && typeof afterRender === 'function') {
      afterRender(element)
    }
  }
}
