import ko from 'knockout'
import Chart from 'components/Chart'
import Component from 'components/Component'
import atlascharts from 'atlascharts'
import view from 'components/charts/chart.html?raw'
import commonUtils from 'utils/CommonUtils'

class Scatterplot extends Chart {
  constructor (params, element) {
    super(params, element)
    this.renderer = new atlascharts.scatterplot()
  }
}

export default commonUtils.build('scatterplot', Scatterplot, view)
