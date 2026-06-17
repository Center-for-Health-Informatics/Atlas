import ko from 'knockout'
import view from './concept-drilldown-report.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import sharedState from 'atlas-state'
import httpService from 'services/http'
import authApi from 'services/AuthAPI'
import PermissionService from 'pages/concept-sets/PermissionService'
import constants from 'components/reports/const'
import 'components/reports/reportDrilldown'

class ConceptDrilldownReport extends Component {
  constructor (params) {
    super(params)
    this.currentConceptId = params.currentConceptId
    this.hasInfoAccess = params.hasInfoAccess
    this.isAuthenticated = params.isAuthenticated
    this.currentConcept = params.currentConcept
    this.sourceCounts = ko.observableArray()
    this.isLoading = ko.observable(false)
    this.loadingReport = ko.observable(false)
    this.loadingDrilldownDone = ko.observable(false)
    this.showLoadingDrilldownModal = ko.observable(false)
    this.hasError = ko.observable(false)
    this.errorMessage = ko.observable()
    this.currentReport = ko.computed(() => this.setCurrentReport(this.currentConcept(), constants.reports))

    this.currentSource = ko.observable()
    this.sources = ko.computed(() => {
      const resultSources = []
      sharedState.sources().forEach((source) => {
        if (source.hasResults && authApi.isPermittedAccessSource(source.sourceKey)) {
          resultSources.push(source)
          if (source.resultsUrl === sharedState.resultsUrl()) {
            this.currentSource(source)
          }
        }
      })

      return resultSources
    })
  }

  setCurrentReport (concept, reports) {
    const conceptDomain = concept.DOMAIN_ID.toLowerCase()
    const currentReport = reports.find(report => report.path === conceptDomain)
    return currentReport
  }
}

export default commonUtils.build('concept-drilldown-report', ConceptDrilldownReport, view)

