import ko from 'knockout'
import view from './treemap.html?raw'
import TreemapReport from 'components/reports/classes/Treemap'
import Component from 'components/Component'
import constants from 'components/reports/const'
import commonUtils from 'utils/CommonUtils'
import 'components/heading'
import 'components/charts/treemap'
import 'components/reports/reportDrilldown'

class Observation extends TreemapReport {
  constructor (params) {
    super(params)

    this.name = 'Observation' // header

    this.byFrequency = true
    this.byType = true
    this.byValueAsConcept = true
    this.byQualifier = true
  }

  get aggProperty () {
    return constants.aggProperties.byPerson
  }
}

export default commonUtils.build('report-observation', Observation, view)
