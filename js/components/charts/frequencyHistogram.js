import Chart from 'components/Chart'
import atlascharts from 'atlascharts'
import view from 'components/charts/chart.html?raw'
import commonUtils from 'utils/CommonUtils'

class FrequencyHistogramComponent extends Chart {
  constructor (params, element) {
    super(params, element)
    // eslint-disable-next-line new-cap
    this.renderer = new atlascharts.histogram()
  }
}

export default commonUtils.build('frequency-histogram', FrequencyHistogramComponent, view)
