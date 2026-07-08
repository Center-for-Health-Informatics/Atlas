import ko from 'knockout'
import view from './concept-manager.html?raw'
import Page from 'pages/Page'
import AutoBind from 'utils/AutoBind'
import vocabularyProvider from 'services/Vocabulary'
import commonUtils from 'utils/CommonUtils'
import conceptSetService from 'services/ConceptSet'
import ConceptSetStore from 'components/conceptset/ConceptSetStore'
import conceptSetUtils from 'components/conceptset/utils'
import renderers from 'utils/Renderers'
import sharedState from 'atlas-state'
import httpService from 'services/http'
import constants from '../../const'
import authApi from 'services/AuthAPI'
import * as PermissionService from '../../PermissionService'
import 'faceted-datatable'
import 'components/heading'
import 'components/conceptLegend/concept-legend'
import 'components/conceptAddBox/concept-add-box'
import './concept-manager.less'
import 'components/tabs'
import './components/tabs/concept-details'
import './components/tabs/concept-related'
import './components/tabs/concept-hierarchy'
import './components/tabs/concept-count'
import './components/tabs/concept-drilldown-report'

class ConceptManager extends AutoBind(Page) {
  constructor (params) {
    super(params)
    this.currentConceptId = ko.observable()
    this.currentConcept = ko.observable()

    this.isLoading = ko.observable(false)
    this.isAuthenticated = authApi.isAuthenticated
    this.hasInfoAccess = ko.computed(() => PermissionService.isPermittedGetInfo(sharedState.sourceKeyOfVocabUrl(), this.currentConceptId()))

    this.tabParams = ko.observable({
      currentConcept: this.currentConcept,
      currentConceptId: this.currentConceptId,
      hasInfoAccess: this.hasInfoAccess,
      isAuthenticated: this.isAuthenticated,
      addConcepts: this.addConcepts.bind(this),
      addConcept: this.addConcept
    })
  }

  async onPageCreated () {
    this.currentConceptId(this.routerParams.conceptId)
    this.loadConcept(this.currentConceptId())
    super.onPageCreated()
  }

  onRouterParamsChanged ({ conceptId }) {
    if (conceptId !== this.currentConceptId() && conceptId !== undefined) {
      this.currentConceptId(conceptId)
      this.loadConcept(this.currentConceptId())
    }
  }

  addConcept (options, conceptSetStore = ConceptSetStore.repository()) {
    // add the current concept
    const items = commonUtils.buildConceptSetItems([this.currentConcept()], options)
    conceptSetUtils.addItemsToConceptSet({ items, conceptSetStore })
  }

  // produces a closure to wrap options and source around a function
  // that accepts the source selected concepts list
  addConcepts (options, conceptSetStore = ConceptSetStore.repository()) {
    return (conceptsArr, isCurrentConcept = false) => {
      const concepts = commonUtils.getSelectedConcepts(conceptsArr)
      const items = commonUtils.buildConceptSetItems(concepts, options)
      conceptSetUtils.addItemsToConceptSet({ items, conceptSetStore })
      commonUtils.clearConceptsSelectionState(conceptsArr)
    }
  }

  enhanceConcept (concept) {
    return {
      ...concept,
      isSelected: ko.observable(false),
    }
  }

  async loadConcept (conceptId) {
    this.isLoading(true)
    if (!this.hasInfoAccess()) {
      return
    }

    const { data } = await httpService.doGet(sharedState.vocabularyUrl() + 'concept/' + conceptId)
    this.currentConcept(this.enhanceConcept(data))
    this.isLoading(false)
  }
}

export default commonUtils.build('concept-manager', ConceptManager, view)
