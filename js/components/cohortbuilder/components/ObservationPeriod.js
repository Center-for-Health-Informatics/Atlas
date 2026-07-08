import ko from 'knockout'
import options from '../options'
import Range from '../InputTypes/Range'
import DateAdjustment from '../InputTypes/DateAdjustment'
import ConceptSetSelection from '../InputTypes/ConceptSetSelection'
import Period from '../InputTypes/Period'
import CriteriaGroup from '../CriteriaGroup'
import template from './ObservationPeriodTemplate.html?raw'
import constants from '../const'

function ObservationPeriodViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.ObservationPeriod
  self.options = options

  self.addActions = [
    {
      ...constants.observationPeriodAttributes.addFirstDiagnosis,
      selected: false,
      action: function () {
        if (self.Criteria.First() == null) self.Criteria.First(true)
      },
    },
    {
      ...constants.observationPeriodAttributes.addAgeAtStart,
      selected: false,
      action: function () {
        if (self.Criteria.AgeAtStart() == null) { self.Criteria.AgeAtStart(new Range()) }
      },
    },
    {
      ...constants.observationPeriodAttributes.addUserDefined,
      selected: false,
      action: function () {
        if (self.Criteria.UserDefinedPeriod() == null) { self.Criteria.UserDefinedPeriod(new Period()) }
      },
    },
    {
      ...constants.observationPeriodAttributes.addAgeAtEnd,
      selected: false,
      action: function () {
        if (self.Criteria.AgeAtEnd() == null) { self.Criteria.AgeAtEnd(new Range()) }
      },
    },
    {
      ...constants.observationPeriodAttributes.addStartDate,
      selected: false,
      action: function () {
        if (self.Criteria.PeriodStartDate() == null) {
          self.Criteria.PeriodStartDate(
            new Range({
              Op: 'lt',
            })
          )
        }
      },
    },
    {
      ...constants.observationPeriodAttributes.addEndDate,
      selected: false,
      action: function () {
        if (self.Criteria.PeriodEndDate() == null) {
          self.Criteria.PeriodEndDate(
            new Range({
              Op: 'lt',
            })
          )
        }
      },
    },
    {
      ...constants.observationPeriodAttributes.addDateAdjustment,
      selected: false,
      action: function () {
        if (self.Criteria.DateAdjustment() == null) self.Criteria.DateAdjustment(new DateAdjustment())
      },
    },
    {
      ...constants.observationPeriodAttributes.addType,
      selected: false,
      action: function () {
        if (self.Criteria.PeriodType() == null) { self.Criteria.PeriodType(ko.observableArray()) }
      },
    },
    {
      ...constants.observationPeriodAttributes.addTypeCS,
      selected: false,
      action: function () {
        if (self.Criteria.PeriodTypeCS() == null) { self.Criteria.PeriodTypeCS(new ConceptSetSelection({}, self.expression.ConceptSets)) }
      },
    },
    {
      ...constants.observationPeriodAttributes.addLength,
      selected: false,
      action: function () {
        if (self.Criteria.PeriodLength() == null) { self.Criteria.PeriodLength(new Range()) }
      },
    },
    {
      ...constants.observationPeriodAttributes.addNested,
      selected: false,
      action: function () {
        if (self.Criteria.CorrelatedCriteria() == null) {
          self.Criteria.CorrelatedCriteria(
            new CriteriaGroup(null, self.expression.ConceptSets)
          )
        }
      },
    },
  ]

  self.removeCriterion = function (propertyName) {
    self.Criteria[propertyName](null)
  }
}

// return compoonent definition
export { ObservationPeriodViewModel, template }
export default { viewModel: ObservationPeriodViewModel, template }

