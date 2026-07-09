import view from './treemap.html?raw'
import TreemapReport from 'components/reports/classes/Treemap'
import constants from 'components/reports/const'
import commonUtils from 'utils/CommonUtils'
import 'components/heading'
import 'components/charts/treemap'
import 'components/reports/reportDrilldown'

class DrugEra extends TreemapReport {
  constructor (params) {
    super(params)

    this.name = 'Drug Era' // header

    this.byLengthOfEra = true
  }

  get aggProperty () {
    return constants.aggProperties.byLengthOfEra
  }
}

export default commonUtils.build('report-drug-era', DrugEra, view)
