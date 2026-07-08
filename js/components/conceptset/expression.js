import ko from 'knockout'
import view from './expression.html?raw'
import config from 'appConfig'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import conceptSetUtils from 'components/conceptset/utils'
import authApi from 'services/AuthAPI'
import conceptSetService from 'services/ConceptSet'
import sharedState from 'atlas-state'
import ConceptSetItem from './InputTypes/ConceptSetItem'
import 'conceptset-editor'
import 'conceptset-modal'
import './expression.less'

class ConceptSetExpression extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.conceptSetListTableApi = params.conceptSetListTableApi || ko.observable()
    this.canEdit = params.canEdit || (() => false)
    // this.conceptSets = params.conceptSets;
    this.conceptSetStore = params.conceptSetStore
    this.currentConceptSet = params.conceptSetStore.current
    this.conceptSetItems = ko.pureComputed(() => (this.currentConceptSet() && this.currentConceptSet().expression.items()) || [])
    // this.currentConceptSetSource = params.currentConceptSetSource;
    // this.currentConceptSetStoreKey = `${this.currentConceptSetSource}ConceptSet`;
    this.loading = params.loading
    this.authApi = authApi
    this.canCreateConceptSet = ko.computed(() => {
      return ((this.authApi.isAuthenticated() && this.authApi.isPermittedCreateConceptset()) || !config.userAuthenticationEnabled)
    })
    this.newConceptSetName = ko.observable()
    this.saveConceptSetShow = ko.observable()
    this.data = ko.pureComputed(() => this.conceptSetItems().map((item, idx) => ({ ...item, idx, isSelected: ko.observable() })))
    this.conceptsForRemovalLength = ko.pureComputed(() => this.data().filter(concept => concept.isSelected()).length)
    this.onClose = params.onClose
    this.onDelete = params.onDelete
    this.buttonTooltipText = conceptSetUtils.getPermissionsText(this.canEdit(), ko.i18n('components.conceptSet.actionEdit', 'edit')())
    this.copyButtonTooltipText = conceptSetUtils.getPermissionsText(this.canCreateConceptSet(), ko.i18n('components.conceptSet.actionCreate', 'create')())
    this.tableOptions = params.tableOptions || commonUtils.getTableOptions('M')
  }

  showSaveConceptSet () {
    this.newConceptSetName(this.currentConceptSet().name())
    this.saveConceptSetShow(true)
  }

  addConcepts () {
    sharedState.activeConceptSet(this.conceptSetStore)
    commonUtils.routeTo('/search')
  }

  deleteConcepts () {
    const idxForRemoval = this.data().filter(concept => concept.isSelected()).map(item => item.idx)
    this.conceptSetStore.removeItemsByIndex(idxForRemoval)
  }

  async saveConceptSet () {
    this.saveConceptSetShow(false)
    const conceptSet = {
      id: 0,
      name: this.newConceptSetName()
    }
    const conceptSetItems = conceptSetUtils.toRepositoryConceptSetItems(this.conceptSetItems())
    const { data } = await conceptSetService.saveConceptSet(conceptSet)
    await conceptSetService.saveConceptSetItems(data.id, conceptSetItems)
  }
}

export default commonUtils.build('conceptset-list-expression', ConceptSetExpression, view)
