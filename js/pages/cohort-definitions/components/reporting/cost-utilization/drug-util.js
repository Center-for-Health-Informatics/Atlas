import ko from 'knockout'
import view from './drug-util.html?raw'
import BaseDrugUtilReport from './base-drug-util-report'
import commonUtils from 'utils/CommonUtils'
import 'appConfig'
import './drug-util.less'
import './drug-util-summary'
import './drug-util-detailed'

const componentName = 'cost-utilization-drug-util'

const modes = {
  summary: 'summary',
  detailed: 'detailed',
}

class DrugUtilReport extends BaseDrugUtilReport {
  constructor (params) {
    super(params)
    this.onDrugSelect = this.onDrugSelect.bind(this)
    this.displaySummary = this.displaySummary.bind(this)

    this.cohortId = params.cohortId
    this.window = params.window

    this.source = params.source

    //
    this.modes = modes
    this.currentMode = ko.observable(modes.summary)

    this.drugConceptId = ko.observable(null)
    this.drugName = ko.observable(null)
  }

  onDrugSelect ({ drugId, drugName }) {
    this.drugConceptId(drugId)
    this.drugName(drugName)
    this.currentMode(modes.detailed)
  }

  displaySummary () {
    this.currentMode(modes.summary)
  }
}

export default commonUtils.build(componentName, DrugUtilReport, view)
