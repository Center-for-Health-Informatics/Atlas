import ko from 'knockout'
import Concept from 'conceptpicker/InputTypes/Concept'

function ConceptSetItem (data) {
  const self = this

  self.concept = data.concept && new Concept(data.concept)
  self.isExcluded = ko.observable(data.isExcluded || false)
  self.includeDescendants = ko.observable(data.includeDescendants || false)
  self.includeMapped = ko.observable(data.includeMapped || false)
}

export default ConceptSetItem

