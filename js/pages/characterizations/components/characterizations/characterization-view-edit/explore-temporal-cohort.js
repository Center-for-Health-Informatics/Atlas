import ko from 'knockout'
import commonUtils from 'utils/CommonUtils'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import view from './explore-temporal-cohort.html?raw'
import './explore-temporal-cohort.less'
import 'components/tabs'
import './explore-temporal'

class ExploreTemporalCohort extends AutoBind(Component) {
  constructor (params) {
    super(params)
    const temporal = params.temporal || {}
    this.temporalDataByCohort = temporal.temporalDataByCohort || {}

    this.tabs = this.temporalDataByCohort.map(cohort => ({
      title: cohort.cohortName,
      key: cohort.cohortName,
      componentParams: { data: cohort.temporalInfo },
    }))
    this.selectedTabKey = ko.observable(this.tabs.length > 0 ? this.tabs[0].key : null)
  }
}

commonUtils.build('explore-temporal-cohort', ExploreTemporalCohort, view)
