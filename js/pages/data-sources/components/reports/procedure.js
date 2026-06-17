import ko from 'knockout'
import view from './treemap.html?raw'
import TreemapReport from 'components/reports/classes/Treemap'
import Component from 'components/Component'
import constants from 'components/reports/const'
import commonUtils from 'utils/CommonUtils'
import 'components/heading'
import 'components/charts/treemap'
import 'components/reports/reportDrilldown'

class Procedure extends TreemapReport {
  constructor (params) {
    super(params)

    this.name = 'Procedure' // header

    this.byFrequency = true
    this.byType = true
  }

  get aggProperty () {
    return constants.aggProperties.byPerson
  }
}

export default commonUtils.build('report-procedure', Procedure, view)

