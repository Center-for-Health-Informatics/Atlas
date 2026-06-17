import ko from 'knockout'
import Chart from 'components/Chart'
import Component from 'components/Component'
import atlascharts from 'atlascharts'
import view from 'components/charts/chart.html?raw'
import commonUtils from 'utils/CommonUtils'

class Line extends Chart {
  constructor (params, element) {
    super(params, element)
    this.renderer = new atlascharts.line()
  }
}

export default commonUtils.build('atlasline', Line, view)

