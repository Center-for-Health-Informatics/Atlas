import ko from 'knockout'
import view from './cohort-definitions.html?raw'
import config from 'appConfig'
import authApi from 'services/AuthAPI'
import Page from 'pages/Page'
import commonUtils from 'utils/CommonUtils'
import sharedState from 'atlas-state'
import constants from 'pages/cohort-definitions/const'
import 'databindings'
import 'faceted-datatable'
import 'components/heading'
import './cohort-definitions.less'

class CohortDefinitions extends Page {
  constructor (params) {
    super(params)
    this.cohortDefinitionId = ko.observable()
    this.cohortDefinitionId.extend({
      notify: 'always'
    })
    this.currentCohortDefinition = sharedState.CohortDefinition.current

    this.cohortDefinitionId.subscribe((id) => {
      commonUtils.routeTo(constants.paths.details(id))
    })

    this.newCohortButtonCaption = ko.computed(() => {
      if (this.currentCohortDefinition()) {
        return ko.i18n('cohortDefinitions.closeYourCurrentCohort', 'Please close your current cohort definition before creating a new one')
      }
      return ko.i18n('cohortDefinitions.newDefinitionTitle', 'Create a new cohort definition')
    })

    this.isAuthenticated = authApi.isAuthenticated
    this.canReadCohorts = ko.pureComputed(() => (config.userAuthenticationEnabled && this.isAuthenticated() && authApi.isPermittedReadCohorts()) || !config.userAuthenticationEnabled)
    this.canCreateCohort = ko.pureComputed(() => (config.userAuthenticationEnabled && this.isAuthenticated() && authApi.isPermittedCreateCohort()) || !config.userAuthenticationEnabled)
    this.tableOptions = commonUtils.getTableOptions('L')
  }

  newDefinition (data, event) {
    this.cohortDefinitionId('0')
  }
}

commonUtils.build('cohort-definitions', CohortDefinitions, view)
