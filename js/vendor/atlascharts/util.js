/*

Copyright 2017 Observational Health Data Sciences and Informatics

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Author: Christopher Knoll

*/
import * as d3 from 'd3'

const intFormat = d3.format(',.3r')

function wrap (text, width) {
  text.each(function () {
    const text = d3.select(this)
    const words = text.text().split(/\s+/).reverse()
    let word
    let line = []
    let lineNumber = 0
    const lineHeight = 1.1 // ems
    const y = text.attr('y')
    const dy = parseFloat(text.attr('dy'))
    let tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em')
    while ((word = words.pop())) {
      line.push(word)
      tspan.text(line.join(' '))
      if (tspan.node().getComputedTextLength() > width) {
        if (line.length > 1) {
          line.pop() // remove word from line
          words.push(word) // put the word back on the stack
          tspan.text(line.join(' '))
        }
        line = []
        lineNumber += 1
        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', lineNumber * lineHeight + dy + 'em')
      }
    }
  })
}

function formatInteger (d) {
  return intFormat(d)
}

// d3.round(value, precision) was removed after d3 v4.
function round (value, precision) {
  const factor = Math.pow(10, precision || 0)
  return Math.round(value * factor) / factor
}

// d3.formatPrefix(value) used to return a { scale, symbol } pair for values >= 1;
// d3 v5+'s formatPrefix(specifier, value) instead returns a ready-to-use SI-suffixed
// formatter, which is a strict superset of what this needed.
function formatSI (p) {
  p = p || 0
  const siFormat = d3.format(',.' + p + '~s')
  return function (d) {
    if (d < 1) {
      return round(d, p)
    }
    return siFormat(d)
  }
}

function buildHierarchy (data, sequenceAccessor, sizeAccessor) {
  // Based on sunburst demo found here:
  // https://bl.ocks.org/kerryrodden/766f8f6d31f645c39f488a0befa1e3c8

  //  Copyright 2013 Google Inc. All Rights Reserved.
  //
  //  Licensed under the Apache License, Version 2.0 (the "License");
  //  you may not use this file except in compliance with the License.
  //  You may obtain a copy of the License at
  //
  //  http://www.apache.org/licenses/LICENSE-2.0

  // Converts an array of data containing paths and counts, and returns a parent-child hierarchy.
  // By default, accpets a 2-column CSV and transform it into a hierarchical structure suitable
  // for a partition layout. The first column is a sequence of step names, from
  // root to leaf, separated by hyphens. The second column is a count of how
  // often that sequence occurred.  Otherwise, pass in a sequenceAccessor and sizeAccessor to fetch the
  // values from each element.

  const seqAccessor = sequenceAccessor || (d => d[0])
  const szAccessor = sizeAccessor || (d => d[1])

  const root = {
    name: 'root',
    children: []
  }
  for (let i = 0; i < data.length; i++) {
    const sequence = seqAccessor(data[i])
    const size = +szAccessor(data[i])
    if (isNaN(size)) { // e.g. if this is a header row, or the accessor did not return data
      continue
    }
    const parts = sequence.split('-')
    let currentNode = root
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode['children']
      const nodeName = parts[j]
      let childNode
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false
        for (let k = 0; k < children.length; k++) {
          if (children[k]['name'] === nodeName && children[k].children) {
            childNode = children[k]
            foundChild = true
            break
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = {
            name: nodeName,
            children: []
          }
          children.push(childNode)
        }
        currentNode = childNode
      } else {
        // Reached the end of the sequence; create a leaf node.
        childNode = {
          name: nodeName,
          size
        }
        children.push(childNode)
      }
    }
  }
  return root
}

export default {
  wrap,
  formatInteger,
  formatSI,
  buildHierarchy
}
