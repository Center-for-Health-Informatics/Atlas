import ko from 'knockout'
import * as d3 from 'd3'
import template from './FeasibilityAttritionReport.html?raw'
import '../css/report.css'

function FeasibilityAttritionReport (params) {
  const self = this

  function countMatch (node, mask) {
    let count = 0
    if (Object.prototype.hasOwnProperty.call(node, 'children')) {
      node.children.forEach(function (c) {
        count += countMatch(c, mask)
      })
    } else {
      count = node.name.startsWith(mask) ? node.size : 0
    }
    return count
  }

  self.report = params.report
  self.attritionStats = ko.pureComputed(function () {
    const treemapData = JSON.parse(self.report().treemapData)
    // create the attrition counts based on the index of the inclusion rule.
    // index 0 must match startWith('1'), index 1 must startWith('11'), etc.
    let priorPct = 1.0
    const stats = self.report().inclusionRuleStats.map(function (d, i) {
      const countSatisfying = countMatch(treemapData, '1'.repeat(i + 1))
      const percentSatisfying = self.report().summary.baseCount !== 0 ? countSatisfying / self.report().summary.baseCount : 0
      const pctDiff = priorPct - percentSatisfying
      priorPct = percentSatisfying
      return {
        name: d.name,
        countSatisfying,
        percentSatisfying,
        pctDiff
      }
    })
    return stats
  })

  self.formatPercent = function (value) {
    return (100.0 * value).toFixed(2) + '%'
  }

  self.attritionBarTooltip = function (index) {
    if (self.attritionStats()) {
      const attritionStat = self.attritionStats()[index]
      return 'Rule ' + attritionStat.name + ': ' + attritionStat.countSatisfying.toLocaleString() + ', ' +
      this.formatPercent(attritionStat.percentSatisfying)
    }
    return ''
  }

  self.color = d3.scaleThreshold()
    .domain([0.1, 0.25, 0.5, 0.75])
    .range(['#FF3D19', '#E77F13', '#C9C40D', '#95B90A', '#7BB209'])
}

const component = {
  viewModel: FeasibilityAttritionReport,
  template
}

ko.components.register('feasibility-attrition-report', component)

// return compoonent definition
export default component
