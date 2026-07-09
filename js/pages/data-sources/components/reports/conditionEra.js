import view from './treemap.html?raw'
import TreemapReport from 'components/reports/classes/Treemap'
import constants from 'components/reports/const'
import commonUtils from 'utils/CommonUtils'
import 'components/heading'
import 'components/charts/treemap'
import 'components/reports/reportDrilldown'

class ConditionEra extends TreemapReport {
  constructor (params) {
    super(params)

    this.name = 'Condition Era' // header
  }

  get aggProperty () {
    return constants.aggProperties.byLengthOfEra
  }
}

export default commonUtils.build('report-condition-era', ConditionEra, view)
