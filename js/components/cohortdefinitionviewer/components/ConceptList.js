import ko from 'knockout'
import template from './ConceptListTemplate.html?raw'

function CocneptListViewModel (params) {
  const self = this
  self.ConceptList = ko.utils.unwrapObservable(params.$raw.ConceptList)
  self.PickerParams = params.PickerParams

  self.ConceptListNames = ko.pureComputed(function () {
    return ko.utils.unwrapObservable(self.ConceptList).map(function (item) { return item.CONCEPT_NAME }).join(', ')
  })
}

// return compoonent definition
export { CocneptListViewModel, template }
export default { viewModel: CocneptListViewModel, template }
