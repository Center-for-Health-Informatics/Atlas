import ko from 'knockout'
import ConceptSetStore from 'components/conceptset/ConceptSetStore'
import ConceptSetItem from 'components/conceptset/InputTypes/ConceptSetItem'
import conceptSetUtils from 'components/conceptset/utils'
import Component from 'components/Component'
import CommonUtils from 'utils/CommonUtils'
import AuthAPI from 'services/AuthAPI'
import sharedState from 'atlas-state'
import config from 'appConfig'
import globalConstants from 'const'
import view from './concept-add-box.html?raw'
import './concept-add-box.less'
import 'databindings/cohortbuilder/dropupBinding'
import './preview/conceptset-expression-preview'
import './preview/included-preview'
import './preview/included-preview-badge'
import './preview/included-sourcecodes-preview'

const storeKeys = ConceptSetStore.sourceKeys()

class ConceptAddBox extends Component {
  constructor (params) {
    super(params)
    this.activeConceptSet = params.activeConceptSet || sharedState.activeConceptSet
    this.canCreateConceptSet = ko.pureComputed(function () {
      return ((AuthAPI.isAuthenticated() && AuthAPI.isPermittedCreateConceptset()) || !config.userAuthenticationEnabled)
    })
    this.isActive = params.isActive || ko.observable(true)
    this.onSubmit = params.onSubmit
    this.noPreview = params.noPreview || false
    this.conceptsToAdd = params.concepts
    this.canSelectSource = params.canSelectSource || false
    this.overrideHandleAddToConceptSet = params.overrideHandleAddToConceptSet
    this.isAdded = ko.observable(false)
    this.defaultSelectionOptions = {
      includeDescendants: ko.observable(false),
      includeMapped: ko.observable(false),
      isExcluded: ko.observable(false),
    }
    this.selectionOptions = ko.observable(this.defaultSelectionOptions)
    this.conceptSetType = {
      [storeKeys.repository]: 'Repository',
      [storeKeys.featureAnalysis]: 'Feature Analysis',
      [storeKeys.cohortDefinition]: 'Cohort Definition',
      [storeKeys.characterization]: 'Characterization',
      [storeKeys.incidenceRates]: 'Incidence Rates',
    }

    this.activeConceptSets = ko.pureComputed(() => {
      return ConceptSetStore.activeStores()
    })
    this.hasActiveConceptSets = ko.pureComputed(() => !!this.activeConceptSets().length)
    this.buttonText = this.hasActiveConceptSets() && this.activeConceptSet() && this.activeConceptSet().current()
      ? ko.i18n('components.conceptAddBox.addToConceptSet', 'Add To Concept Set')
      : ko.i18n('components.conceptAddBox.addToNewConceptSet', 'Add To New Concept Set')
    this.activeConceptSetName = ko.pureComputed(() => {
      if (this.activeConceptSet() && this.activeConceptSet().current()) {
        return `${this.activeConceptSet().current().name()} (${this.conceptSetType[this.activeConceptSet().source]})`
      }
      return ko.i18n('components.conceptAddBox.selectConceptSet', 'Select Concept Set')
    })
    this.canAddConcepts = ko.pureComputed(() => {
      if (this.canSelectSource) {
        return this.hasActiveConceptSets()
          ? (this.activeConceptSet() && this.activeConceptSet().source && this.isActive() && this.activeConceptSet().isEditable())
          : this.isActive() && this.canCreateConceptSet()
      }
      return this.isActive()
    })
    this.isSuccessMessageVisible = ko.observable(false)
    this.messageTimeout = null
    this.isDisabled = ko.pureComputed(() => !this.isActive() || !!this.isSuccessMessageVisible())
    this.buttonTooltipText = conceptSetUtils.getPermissionsText(this.hasActiveConceptSets() || this.canCreateConceptSet(), 'create')

    const tableOptions = CommonUtils.getTableOptions('L')
    this.previewConcepts = ko.observableArray()
    this.showPreviewModal = ko.observable(false)
    /*      this.showPreviewModal.subscribe((show) => {
      if (!show) {
        this.previewConcepts([]);
      }
    }); */
    this.previewTabsParams = ko.observable({
      tabs: [
        {
          title: ko.i18n('components.conceptAddBox.previewModal.tabs.concepts', 'Concepts'),
          key: 'expression',
          componentName: 'conceptset-expression-preview',
          componentParams: {
            tableOptions,
            conceptSetItems: this.previewConcepts
          },
        },
        {
          title: ko.i18n('cs.manager.tabs.includedConcepts', 'Included Concepts'),
          key: 'included',
          componentName: 'conceptset-list-included-preview',
          componentParams: {
            tableOptions,
            previewConcepts: this.previewConcepts
          },
          hasBadge: true,
        },
        {
          title: ko.i18n('cs.manager.tabs.includedSourceCodes', 'Source Codes'),
          key: 'included-sourcecodes',
          componentName: 'conceptset-list-included-sourcecodes-preview',
          componentParams: {
            tableOptions,
            previewConcepts: this.previewConcepts
          },
        }
      ]
    })
  }

  isPreviewAvailable () {
    return !this.noPreview
  }

  handlePreview () {
    const items = CommonUtils.buildConceptSetItems(this.conceptsToAdd(), this.selectionOptions())
    const itemsToAdd = items.map(item => new ConceptSetItem(item))
    const existingConceptsCopy = this.activeConceptSet() && this.activeConceptSet().current()
      ? this.activeConceptSet().current().expression.items().map(item => new ConceptSetItem(ko.toJS(item)))
      : []
    this.previewConcepts(itemsToAdd.concat(existingConceptsCopy))
    this.showPreviewModal(true)
  }

  handleSubmit () {
    if (this.overrideHandleAddToConceptSet) {
      const items = CommonUtils.buildConceptSetItems(this.conceptsToAdd(), this.selectionOptions())
      this.overrideHandleAddToConceptSet(items)
    } else {
      clearTimeout(this.messageTimeout)
      this.isSuccessMessageVisible(true)
      this.messageTimeout = setTimeout(() => {
        this.isSuccessMessageVisible(false)
      }, 1000)

      if (this.noPreview) {
        this.onSubmit(this.selectionOptions())
        return
      }

      const conceptSet = this.activeConceptSet() || ConceptSetStore.repository()

      sharedState.activeConceptSet(conceptSet)

      const filterSource = localStorage?.getItem('filter-source') || null
      const filterData = JSON.parse(localStorage?.getItem('filter-data') || null)
      const datasAdded = JSON.parse(localStorage?.getItem('data-add-selected-concept') || null) || []
      const dataSearch = { filterData, filterSource }
      const payloadAdd = this.conceptsToAdd().map(item => {
        return {
          searchData: dataSearch,
          vocabularyVersion: sharedState.currentVocabularyVersion(),
          conceptId: item.CONCEPT_ID
        }
      })

      localStorage.setItem('data-add-selected-concept', JSON.stringify([...datasAdded, ...payloadAdd]))

      // if concepts were previewed, then they already built and can have individual option flags!
      if (this.previewConcepts().length > 0) {
        if (!conceptSet.current()) {
          conceptSetUtils.createRepositoryConceptSet(conceptSet)
        }
        conceptSet.current().expression.items(this.previewConcepts())
      } else {
        const items = CommonUtils.buildConceptSetItems(this.conceptsToAdd(), this.selectionOptions())
        conceptSetUtils.addItemsToConceptSet({ items, conceptSetStore: conceptSet })
      }

      CommonUtils.clearConceptsSelectionState(this.conceptsToAdd())
      this.selectionOptions(this.defaultSelectionOptions)
    }
  }

  toggleSelectionOption (option) {
    const options = this.selectionOptions()
    this.selectionOptions({
      ...options,
      [option]: ko.observable(!options[option]()),
    })
  }

  setActiveConceptSet (conceptSet) {
    this.activeConceptSet(conceptSet)
  }
}

export default CommonUtils.build('concept-add-box', ConceptAddBox, view)

