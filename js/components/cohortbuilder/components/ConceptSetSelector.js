define([
  'knockout',
  'text!./ConceptSetSelectorTemplate.html',
  'databindings/cohortbuilder/dropupBinding',
  'databindings',
], function (ko, template) {
  function conceptSetSorter (a, b) {
    const textA = a.name().toUpperCase()
    const textB = b.name().toUpperCase()
    return textA < textB ? -1 : textA > textB ? 1 : 0
  }

  function conceptsetSelector (params) {
    const self = this
    self.conceptSetId = params.conceptSetId
    self.defaultName = params.defaultName
    self.conceptSets = params.conceptSets
    self.filterText = ko.observable('')
    self.previewVisible = ko.observable(false)
    self.previewTop = ko.observable(0)
    self.previewLeft = ko.observable(0)

    self.previewConceptSet = ko.observable()

    self.sortedConceptSets = self.conceptSets.extend({
      sorted: conceptSetSorter,
    })
    self.filteredConceptSets = ko.pureComputed(function () {
      const selectedConceptSet = self.conceptSets().filter(function (item) {
        return item.id == self.conceptSetId()
      })
      const filterText = self.filterText().toLowerCase()
      return [
        ...selectedConceptSet,
        ...self
          .sortedConceptSets()
          .filter(
            (cs) =>
              cs.name().toLowerCase().match(filterText) &&
              cs.id !== (selectedConceptSet[0] && selectedConceptSet[0].id)
          ),
      ]
    })
    self.conceptSetName = ko.pureComputed(function () {
      const selectedConceptSet = self.conceptSets().find(function (item) {
        return item.id == self.conceptSetId()
      })
      return (
        ((selectedConceptSet && selectedConceptSet.name()) ||
        ko.unwrap(self.defaultName))
      )
    })

    self.itemClicked = function (item) {
      self.conceptSetId(item.id)
      self.previewVisible(false)
    }

    self.showConceptSetPreview = function (item, context, event) {
      const menuElement = $(event.currentTarget).closest('ul')
      const position = menuElement.position()
      self.previewConceptSet(item)
      self.previewTop(position.top)
      self.previewLeft(position.left + menuElement.width() + 10)
      self.previewVisible(true)
    }

    self.hideConceptSetPreview = function (item, context, event) {
      self.previewVisible(false)
    }

    self.clear = function () {
      self.conceptSetId(null)
    }
  }

  const component = {
    viewModel: conceptsetSelector,
    template,
  }

  ko.components.register('conceptset-selector', component)
  return component
})
