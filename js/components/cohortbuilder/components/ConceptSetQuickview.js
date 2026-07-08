import ko from 'knockout'
import componentTemplate from './ConceptSetQuickviewTemplate.html?raw'

function ConceptSetQuickviewModel (params) {
  const self = this
  let excludesDefault = true
  let descendantsDefault = true
  let mappedDefault = true

  self.conceptSet = ko.computed(() =>
    ko.utils.unwrapObservable(params.conceptSet)
  )

  // behaviors

  self.toggleExcludes = function () {
    self
      .conceptSet()
      .expression.items()
      .forEach((item) => item.isExcluded(excludesDefault))
    excludesDefault = !excludesDefault
  }

  self.toggleDescendants = function () {
    self
      .conceptSet()
      .expression.items()
      .forEach((item) => item.includeDescendants(descendantsDefault))
    descendantsDefault = !descendantsDefault
  }

  self.toggleMapped = function () {
    self
      .conceptSet()
      .expression.items()
      .forEach((item) => item.includeMapped(mappedDefault))
    mappedDefault = !mappedDefault
  }
}

export default {
  viewModel: ConceptSetQuickviewModel,
  template: componentTemplate,
}
