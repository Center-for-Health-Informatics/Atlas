import ko from 'knockout'
import Criteria from './Criteria'
import Range from '../InputTypes/Range'
import ConceptSetSelection from '../InputTypes/ConceptSetSelection'
import Concept from 'conceptpicker/InputTypes/Concept'
import Text from '../InputTypes/Text'

function VisitDetail (data, conceptSets) {
  const self = this
  data = data || {}

  Criteria.call(this, data, conceptSets)
  // set up subscription to update CodesetId and VisitSourceConcept if the item is removed from conceptSets
  conceptSets.subscribe(function (changes) {
    changes.forEach(function (change) {
      if (change.status === 'deleted') {
        if (ko.utils.unwrapObservable(self.CodesetId) == change.value.id) {
          self.CodesetId(null)
        }
        if (ko.utils.unwrapObservable(self.VisitDetailSourceConcept()) == change.value.id) {
          self.VisitSourceConcept()(null)
        }
      }
    })
  }, null, 'arrayChange')

  // General Condition Occurence Criteria

  // Verbatim fields
  self.CodesetId = ko.observable(data.CodesetId)

  self.VisitDetailStartDate = ko.observable(data.VisitDetailStartDate && new Range(data.VisitDetailStartDate))
  self.VisitDetailEndDate = ko.observable(data.VisitDetailEndDate && new Range(data.VisitDetailEndDate))
  self.VisitDetailTypeCS = ko.observable(data.VisitDetailTypeCS && new ConceptSetSelection(data.VisitDetailTypeCS, conceptSets))
  self.VisitDetailSourceConcept = ko.observable(data.VisitDetailSourceConcept != null ? ko.observable(data.VisitDetailSourceConcept) : null)
  self.VisitDetailLength = ko.observable(data.VisitDetailLength && new Range(data.VisitDetailLength))

  // Derived Fields
  self.First = ko.observable(data.First || null)
  self.Age = ko.observable(data.Age && new Range(data.Age))

  // Linked Fields
  self.GenderCS = ko.observable(data.GenderCS && new ConceptSetSelection(data.GenderCS, conceptSets))
  self.ProviderSpecialtyCS = ko.observable(data.ProviderSpecialtyCS && new ConceptSetSelection(data.ProviderSpecialtyCS, conceptSets))
  self.PlaceOfServiceCS = ko.observable(data.PlaceOfServiceCS && new ConceptSetSelection(data.PlaceOfServiceCS, conceptSets))

  self.PlaceOfServiceLocation = ko.observable(data.PlaceOfServiceLocation != null ? ko.observable(data.PlaceOfServiceLocation) : null)
  self.PlaceOfServiceDistance = ko.observable(data.PlaceOfServiceDistance && new Range(data.PlaceOfServiceDistance))
}

VisitDetail.prototype = new Criteria()
VisitDetail.prototype.constructor = VisitDetail
VisitDetail.prototype.toJSON = function () {
  return this
}

export default VisitDetail

