import ko from 'knockout'
import Criteria from './Criteria'
import Range from '../InputTypes/Range'
import Period from '../InputTypes/Period'
import Concept from 'conceptpicker/InputTypes/Concept'
import ConceptSetSelection from '../InputTypes/ConceptSetSelection'

function ObservationPeriod (data, conceptSets) {
  const self = this
  data = data || {}

  Criteria.call(this, data, conceptSets)

  self.First = ko.observable(data.First || null)
  self.PeriodStartDate = ko.observable(data.PeriodStartDate && new Range(data.PeriodStartDate))
  self.PeriodEndDate = ko.observable(data.PeriodEndDate && new Range(data.PeriodEndDate))
  self.PeriodType = ko.observable(data.PeriodType && ko.observableArray(data.PeriodType.map(function (d) {
    return new Concept(d)
  })))
  self.PeriodTypeCS = ko.observable(data.PeriodTypeCS && new ConceptSetSelection(data.PeriodTypeCS, conceptSets))

  self.UserDefinedPeriod = ko.observable(data.UserDefinedPeriod && new Period(data.UserDefinedPeriod))

  // Derived Fields
  self.AgeAtStart = ko.observable(data.AgeAtStart && new Range(data.AgeAtStart))
  self.AgeAtEnd = ko.observable(data.AgeAtEnd && new Range(data.AgeAtEnd))
  self.PeriodLength = ko.observable(data.PeriodLength && new Range(data.PeriodLength))
}

ObservationPeriod.prototype = new Criteria()
ObservationPeriod.prototype.constructor = ObservationPeriod
ObservationPeriod.prototype.toJSON = function () {
  return this
}

export default ObservationPeriod

