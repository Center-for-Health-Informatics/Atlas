import $ from 'jquery'
import ko from 'knockout'
import * as d3 from 'd3'

function renderTreemap (data, target, options) {
  const w = 400
  const h = 400
  const x = d3.scaleLinear().range([0, w])
  const y = d3.scaleLinear().range([0, h])

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
      return options.colorPicker && options.colorPicker(d.data) || '#FFFFFF'
    })
    .on('mouseover', function () {
      d3.select(this).classed('selected', true)
    })
    .on('mouseout', function () {
      d3.select(this).classed('selected', false)
    })
}

ko.bindingHandlers.treemap = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    return { controlsDescendantBindings: true }
  },
  update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    const data = JSON.parse(valueAccessor().data)
    const options = valueAccessor().options
    d3.select(element).selectAll('svg').remove()
    renderTreemap(data, element, options)
  }
}
