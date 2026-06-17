import ko from 'knockout'
import Chart from 'components/Chart'
import Component from 'components/Component'
import atlascharts from 'atlascharts'
import view from './chart.html?raw'
import commonUtils from 'utils/CommonUtils'
import './chart.less'

class Sunburst extends Chart {
  constructor (params, element) {
    super(params, element)
    this.renderer = new atlascharts.sunburst()
  }
}

export default commonUtils.build('sunburst', Sunburst, view)

