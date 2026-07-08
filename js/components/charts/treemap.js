import ko from 'knockout'
import Chart from 'components/Chart'
import Component from 'components/Component'
import atlascharts from 'atlascharts'
import view from 'components/charts/chart.html?raw'
import commonUtils from 'utils/CommonUtils'
import ChartUtils from 'utils/ChartUtils'

class Treemap extends Chart {
  constructor (params, element) {
    super(params, element)
    this.renderer = new atlascharts.treemap()
    this.storeParams(params)
    if (params.data()) {
      const hierarchy = ChartUtils.buildHierarchyFromJSON(params.data(), this.threshold, params.aggProperty)
      this.rawData(hierarchy)
    }
  }

  storeParams (params) {
    super.storeParams(params)
    const width = this.width || this.minHeight
    this.threshold = params.format.minimumArea / (width * this.minHeight)
  }
}

export default commonUtils.build('treemap', Treemap, view)
