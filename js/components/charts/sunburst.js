import Chart from 'components/Chart'
import atlascharts from 'atlascharts'
import view from './chart.html?raw'
import commonUtils from 'utils/CommonUtils'
import './chart.less'

class Sunburst extends Chart {
  constructor (params, element) {
    super(params, element)
    // eslint-disable-next-line new-cap
    this.renderer = new atlascharts.sunburst()
  }
}

export default commonUtils.build('sunburst', Sunburst, view)
