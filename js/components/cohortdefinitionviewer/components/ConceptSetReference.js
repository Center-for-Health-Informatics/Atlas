define(['knockout', 'text!./ConceptSetReferenceTemplate.html'], function (ko, template) {
  function conceptSetSorter (a, b) {
    const textA = a.name().toUpperCase()
    const textB = b.name().toUpperCase()
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
  }

  function ConceptSetReference (params) {
    const self = this
    self.conceptSetId = params.conceptSetId
    self.conceptSets = params.conceptSets
    self.sortedConceptSets = self.conceptSets.extend({ sorted: conceptSetSorter })
    self.defaultName = params.defaultName

    self.referenceId = ko.pureComputed(function () {
      let calculatedRefId = ''
      const selectedConceptSet = self.conceptSets().find(function (item) { return item.id == ko.utils.unwrapObservable(self.conceptSetId) })
      if (selectedConceptSet) {
        calculatedRefId = (self.sortedConceptSets().indexOf(selectedConceptSet) + 1) + ''
      }
      return calculatedRefId
    })

    self.codesetName = ko.pureComputed(function () {
      const selectedConceptSet = self.conceptSets().find(function (item) { return item.id == ko.utils.unwrapObservable(self.conceptSetId) })
      if (selectedConceptSet) {
        return ko.utils.unwrapObservable(selectedConceptSet.name)
      } else { return self.defaultName }
    })
  }

  // return compoonent definition
  return {
    viewModel: ConceptSetReference,
    template
  }
})
