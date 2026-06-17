import ko from 'knockout'
import view from './included.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import sharedState from 'atlas-state'
import conceptSetService from 'services/ConceptSet'
import conceptSetUtils from './utils'
import 'components/conceptAddBox/concept-add-box'
import './concept-modal'
import 'components/dataSourceSelect'

class IncludedConcepts extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.canEdit = params.canEdit
    this.conceptSetStore = params.conceptSetStore
    this.selectedSource = params.selectedSource
    this.includedConcepts = this.conceptSetStore.includedConcepts
    this.commonUtils = commonUtils
    this.loading = params.loading
    this.includedConceptsColumns = conceptSetUtils.getIncludedConceptsColumns({ canEditCurrentConceptSet: this.canEdit }, commonUtils,
      (data, selected) => {
        const conceptIds = data.map(c => c.CONCEPT_ID)
        ko.utils.arrayForEach(this.includedConcepts(), c => conceptIds.indexOf(c.CONCEPT_ID) > -1 && c.isSelected(selected))
        this.includedConcepts.valueHasMutated()
      })
    this.includedConceptsOptions = conceptSetUtils.includedConceptsOptions
    this.canAddConcepts = ko.pureComputed(() => this.includedConcepts() && this.includedConcepts().some(item => item.isSelected()))
    this.tableOptions = params.tableOptions || commonUtils.getTableOptions('M')
    this.ancestorsModalIsShown = ko.observable(false)
    this.ancestors = ko.observableArray([])
    this.showAncestorsModal = conceptSetUtils.getAncestorsModalHandler({
      conceptSetStore: this.conceptSetStore,
      ancestors: this.ancestors,
      ancestorsModalIsShown: this.ancestorsModalIsShown
    })
    this.includedDrawCallback = conceptSetUtils.getIncludedConceptSetDrawCallback(this.includedConceptsColumns, this.conceptSetStore)
  }

  getSelectedConcepts () {
    return ko.unwrap(this.includedConcepts) && commonUtils.getSelectedConcepts(this.includedConcepts)
  }

  addConcepts (options) {
    this.conceptSetStore.loadingIncluded(true)
    const items = commonUtils.buildConceptSetItems(this.getSelectedConcepts(), options)
    conceptSetUtils.addItemsToConceptSet({
      items,
      conceptSetStore: this.conceptSetStore,
    })
    commonUtils.clearConceptsSelectionState(this.includedConcepts)
  }
}

export default commonUtils.build('conceptset-list-included', IncludedConcepts, view)

