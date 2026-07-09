import ko from 'knockout'
import template from './ConceptListTemplate.html?raw'

function CocneptListViewModel (params) {
  const self = this
  self.ConceptList = ko.utils.unwrapObservable(params.$raw.ConceptList)
  self.PickerParams = params.PickerParams

  // onAdd handler
  self.addConcepts = function (concepts) {
    // remove only add new concepts.
    const ixConcepts = {}
    self.ConceptList().forEach(function (item) {
      ixConcepts[item.CONCEPT_ID] = true
    })

    const importedConcepts = []
    concepts.forEach(function (item) {
      if (!ixConcepts[item.CONCEPT_ID]) importedConcepts.push(item)
    })

    self.ConceptList(self.ConceptList().concat(importedConcepts))
  }

  self.removeConcept = function (item) {
    this.ConceptList.remove(item)
  }
}

// return compoonent definition
export { CocneptListViewModel, template }
export default { viewModel: CocneptListViewModel, template }
