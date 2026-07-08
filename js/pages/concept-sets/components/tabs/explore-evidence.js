import ko from 'knockout'
import view from './explore-evidence.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import sharedState from 'atlas-state'
import ConceptSetStore from 'components/conceptset/ConceptSetStore'

class ExploreEvidence extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.currentConceptSet = ConceptSetStore.repository().current
    this.selectedConcepts = ko.pureComputed(() => this.currentConceptSet() && this.currentConceptSet().expression.items())
    this.currentConceptSetDirtyFlag = sharedState.RepositoryConceptSet.dirtyFlag
    this.currentConceptSetNegativeControls = sharedState.RepositoryConceptSet.negativeControls
    this.conceptSetInclusionIdentifiers = ConceptSetStore.repository().conceptSetInclusionIdentifiers
    this.resultsUrl = sharedState.resultsUrl
    this.saveConceptSetFn = params.saveConceptSet
  }

  saveConceptSet (conceptSet, txtElem) {
    return this.saveConceptSetFn(conceptSet, txtElem)
  }
}

export default commonUtils.build('explore-evidence', ExploreEvidence, view)
