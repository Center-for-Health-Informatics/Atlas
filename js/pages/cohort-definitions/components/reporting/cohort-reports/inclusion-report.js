import ko from 'knockout'
import Component from 'components/Component'
import constants from './const'
import commonUtils from 'utils/CommonUtils'
import view from './inclusion-report.html?raw'
import './feasibility-report-viewer-with-header'
import './demographic-report'

class CohortInclusionReport extends Component {
  constructor (params) {
    super()

    this.tabs = ko.computed(() => {
      return [{
        title: ko.i18n('cohortDefinitions.cohortreports.tabs.byPerson', 'By Person'),
        componentName: 'feasibility-report-viewer-with-header',
        componentParams: { ...params, reportType: constants.INCLUSION_REPORT.BY_PERSON },
      },
      {
        title: ko.i18n('cohortDefinitions.cohortreports.tabs.byEvents', 'By All Events'),
        componentName: 'feasibility-report-viewer-with-header',
        componentParams: { ...params, reportType: constants.INCLUSION_REPORT.BY_EVENT },
      }]
    })
  }
}

export default commonUtils.build(
  'cohort-report-inclusion',
  CohortInclusionReport,
  view
)
