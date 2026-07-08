import ko from 'knockout'
import globalConstants from 'const'
import Component from 'components/Component'
import PluginRegistry from 'services/PluginRegistry'
import constants from './const'
import commonUtils from 'utils/CommonUtils'
import view from './cohort-reports.html?raw'
import 'components/tabs'
import './inclusion-report'

PluginRegistry.add(globalConstants.pluginTypes.COHORT_REPORT, {
  title: ko.i18n('cohortDefinitions.cohortreports.inclusionReport', 'Inclusion Report'),
  priority: 1,
  html: '<cohort-report-inclusion params="{ sourceKey: sourceKey, cohortId: cohortId, isViewDemographic: isViewDemographic, ccGenerateId: ccGenerateId }"></cohort-report-inclusion>'
})

class CohortReports extends Component {
  constructor (params) {
    super()

    this.sourceKey = ko.computed(() => params.source() && params.source().sourceKey)
    this.cohortId = ko.computed(() => params.cohort().id())
    this.isViewDemographic = ko.computed(() => params.source() && params.source().viewDemographic())
    this.ccGenerateId = ko.computed(() => params.infoSelected() && params.infoSelected().ccGenerateId())

    const componentParams = {
      sourceKey: this.sourceKey,
      cohortId: this.cohortId,
      isViewDemographic: this.isViewDemographic,
      ccGenerateId: this.ccGenerateId,
    }

    this.tabs = PluginRegistry.findByType(globalConstants.pluginTypes.COHORT_REPORT).map(t => ({ ...t, componentParams }))

    if (this.isViewDemographic()) {
      this.tabs.push({
        title: ko.i18n('cohortDefinitions.cohortreports.tabs.byPerson3', 'Demographics'),
        componentName: 'demographic-report',
        componentParams: {
          ...componentParams,
          reportType: constants.INCLUSION_REPORT.BY_DEMOGRAPHIC,
          buttons: null,
          tableDom: 'Blfiprt'
        }
      })
    }
  }

  dispose () {
    this.sourceKey.dispose()
    this.cohortId.dispose()
    this.isViewDemographic.dispose()
    this.ccGenerateId.dispose()
  }
}

export default commonUtils.build('cohort-reports', CohortReports, view)
