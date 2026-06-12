define(['knockout', 'components/cohortbuilder/options', 'components/cohortbuilder/InputTypes/Range', 'text!./LocationRegionTemplate.html'], function (ko, options, Range, template) {
  function LocationRegionViewModel (params) {
    const self = this
    self.expression = ko.utils.unwrapObservable(params.expression)
    self.Criteria = params.criteria.LocationRegion
    self.options = options

    self.getCodesetName = function (codesetId, defaultName) {
      if (codesetId != null) {
        const selectedConceptSet = self.expression.ConceptSets().filter(function (item) { return item.id == codesetId })[0]
        return ko.utils.unwrapObservable(selectedConceptSet.name)
      } else { return defaultName }
    }
  }

  // return compoonent definition
  return {
    viewModel: LocationRegionViewModel,
    template
  }
})
