import ko from 'knockout'
import * as criteriaTypes from '../CriteriaTypes'
import template from './InitialCriteriaEditor.html?raw'
import constants from '../const'
import './InitialCriteriaEditor.less'

function InitialCriteriaViewModel (params) {
  const self = this

  self.expression = params.expression
  self.buttonText = params.buttonText || ko.i18n('components.cohortExpressionEditor.addInitialEvent', 'Add Initial Event')

  self.primaryCriteriaOptions = [
    {
      ...constants.initialEventList.addConditionEra,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            ConditionEra: new criteriaTypes.ConditionEra(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addConditionOccurrence,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            ConditionOccurrence: new criteriaTypes.ConditionOccurrence(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addDeath,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            Death: new criteriaTypes.Death(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addDeviceExposure,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            DeviceExposure: new criteriaTypes.DeviceExposure(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addDoseEra,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            DoseEra: new criteriaTypes.DoseEra(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addDrugEra,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            DrugEra: new criteriaTypes.DrugEra(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addDrugExposure,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            DrugExposure: new criteriaTypes.DrugExposure(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addMeasurement,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            Measurement: new criteriaTypes.Measurement(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addObservation,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            Observation: new criteriaTypes.Observation(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addObservationPeriod,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            ObservationPeriod: new criteriaTypes.ObservationPeriod(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addPayerPlanPeriod,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            PayerPlanPeriod: new criteriaTypes.PayerPlanPeriod(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addProcedureOccurrence,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            ProcedureOccurrence: new criteriaTypes.ProcedureOccurrence(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addSpecimen,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            Specimen: new criteriaTypes.Specimen(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addVisit,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            VisitOccurrence: new criteriaTypes.VisitOccurrence(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.addVisitDetail,
      selected: false,
      action: function () {
        const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
        unwrappedExpression
          .PrimaryCriteria()
          .CriteriaList.push({
            VisitDetail: new criteriaTypes.VisitDetail(
              null,
              unwrappedExpression.ConceptSets
            ),
          })
      },
    },
    {
      ...constants.initialEventList.fromReusable,
      selected: false,
      action: function () {
        self.showReusablesModal(true)
      }
    },
  ]

  self.removePrimaryCriteria = function (criteria) {
    ko.utils.unwrapObservable(self.expression).PrimaryCriteria().CriteriaList.remove(criteria)
  }

  self.getCriteriaIndexComponent = function (data) {
    data = ko.utils.unwrapObservable(data)

    if (Object.prototype.hasOwnProperty.call(data, 'ConditionOccurrence')) { return 'condition-occurrence-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'ConditionEra')) { return 'condition-era-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'DrugExposure')) { return 'drug-exposure-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'DrugEra')) return 'drug-era-criteria'
    else if (Object.prototype.hasOwnProperty.call(data, 'DoseEra')) return 'dose-era-criteria'
    else if (Object.prototype.hasOwnProperty.call(data, 'ProcedureOccurrence')) { return 'procedure-occurrence-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'Observation')) { return 'observation-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'VisitOccurrence')) { return 'visit-occurrence-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'VisitDetail')) { return 'visit-detail-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'DeviceExposure')) { return 'device-exposure-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'Measurement')) { return 'measurement-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'Specimen')) return 'specimen-criteria'
    else if (Object.prototype.hasOwnProperty.call(data, 'ObservationPeriod')) { return 'observation-period-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'PayerPlanPeriod')) { return 'payer-plan-period-criteria' } else if (Object.prototype.hasOwnProperty.call(data, 'Death')) return 'death-criteria'
    else if (Object.prototype.hasOwnProperty.call(data, 'LocationRegion')) { return 'location-region-criteria' } else return 'unknownCriteriaType'
  }

  self.showReusablesModal = ko.observable(false)
  self.insertFromReusable = (expression, conceptSets) => {
    const unwrappedExpression = ko.utils.unwrapObservable(self.expression)
    if (conceptSets.length > 0) {
      unwrappedExpression.ConceptSets(unwrappedExpression.ConceptSets().concat(conceptSets))
    }
    ko.utils.arrayForEach(expression.CriteriaList(), c => {
      unwrappedExpression.PrimaryCriteria().CriteriaList.push(c)
    })
  }
}

export { InitialCriteriaViewModel, template }
export default { viewModel: InitialCriteriaViewModel, template }
