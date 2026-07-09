import ko from 'knockout'
import view from './conceptsets-list.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import authApi from 'services/AuthAPI'
import ConceptSetStore from 'components/conceptset/ConceptSetStore'
import constants from '../const'
import config from 'appConfig'
import 'components/tabs'
import 'circe'

class ConceptsetList extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.conceptSetStore = ConceptSetStore.getStore(ConceptSetStore.sourceKeys().repository)
    this.currentConceptSet = this.conceptSetStore.current
    this.canCreateConceptSet = ko.pureComputed(function () {
      return ((authApi.isAuthenticated() && authApi.isPermittedCreateConceptset()) || !config.userAuthenticationEnabled)
    })
    this.tableOptions = commonUtils.getTableOptions('L')
  }

  onRespositoryConceptSetSelected (conceptSet) {
    commonUtils.routeTo(constants.paths.mode(conceptSet.id))
  }

  onConceptSetBrowserAction (result) {
    // Inspect the result to see what type of action was taken. For now
    // we're handling the 'add' action
    if (result.action === 'add') {
      this.newConceptSet()
    }
  }

  newConceptSet () {
    if (this.currentConceptSet() === undefined) {
      commonUtils.routeTo(constants.paths.mode())
    }
  }
}

export default commonUtils.build('conceptsets-list', ConceptsetList, view)
