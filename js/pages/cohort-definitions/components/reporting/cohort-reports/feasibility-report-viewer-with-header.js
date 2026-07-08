import ko from 'knockout'
import Component from 'components/Component'
import CohortDefinitionService from 'services/CohortDefinition'
import commonUtils from 'utils/CommonUtils'
import sharedState from 'atlas-state'
import view from './feasibility-report-viewer-with-header.html?raw'

class FeasibilityReportViewerWithHeader extends Component {
  constructor (params) {
    super()

    this.reportType = params.reportType
    this.source = ko.pureComputed(() => {
      return sharedState.sources().find(s => s.sourceKey === params.sourceKey())
    })
    this.cohortId = params.cohortId

    this.isLoading = ko.observable(false)
    this.report = ko.observable()

    this.loadReport()

    this.subscriptions = []
    this.reportParams = ko.pureComputed(() =>
      (this.cohortId() && this.source()) ? { cohortId: this.cohortId(), source: this.source() } : null
    ).extend({ deferred: true })
    this.subscriptions.push(this.reportParams.subscribe(rp => rp && this.loadReport()))
  }

  dispose () {
    this.subscriptions.forEach(sub => sub.dispose())
  }

  async loadReport () {
    this.isLoading(true)
    const report = await CohortDefinitionService.getReport(this.cohortId(), this.source().sourceKey, this.reportType)
    this.report(report)
    this.isLoading(false)
  }
}

export default commonUtils.build('feasibility-report-viewer-with-header', FeasibilityReportViewerWithHeader, view)
