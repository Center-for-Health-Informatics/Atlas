import view from './treemap.html?raw'
import TreemapReport from 'components/reports/classes/Treemap'
import constants from 'components/reports/const'
import commonUtils from 'utils/CommonUtils'
import 'components/heading'
import 'components/charts/treemap'
import 'components/reports/reportDrilldown'

class Measurement extends TreemapReport {
  constructor (params) {
    super(params)

    this.name = 'Measurement' // header

    this.byFrequency = true
    this.byUnit = true
    this.byType = true
    this.byValueAsConcept = true
    this.byOperator = true
  }

  get aggProperty () {
    return constants.aggProperties.byPerson
  }
}

export default commonUtils.build('report-measurement', Measurement, view)
