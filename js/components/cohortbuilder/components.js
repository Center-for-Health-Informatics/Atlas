define(function (require, exports) {
  const ko = require('knockout')

  const expressionEditor = require('./components/CohortExpressionEditor')
  ko.components.register('cohort-expression-editor', expressionEditor)

  const initialCriteriaEditor = require('./components/InitialCriteriaEditor')
  ko.components.register('initial-criteria-editor', initialCriteriaEditor)

  const censoringCriteriaEditor = require('./components/CensoringCriteriaEditor')
  ko.components.register('censoring-criteria-editor', censoringCriteriaEditor)

  const inclusionEditor = require('./components/InclusionRuleEditor')
  ko.components.register('inclusion-rule-editor', inclusionEditor)

  const criteriaGroup = require('./components/CriteriaGroup')
  ko.components.register('criteria-group', criteriaGroup)

  const conditionOccurrence = require('./components/ConditionOccurrence')
  ko.components.register('condition-occurrence-criteria', conditionOccurrence)

  const conditionEra = require('./components/ConditionEra')
  ko.components.register('condition-era-criteria', conditionEra)

  const drugExposure = require('./components/DrugExposure')
  ko.components.register('drug-exposure-criteria', drugExposure)

  const drugEra = require('./components/DrugEra')
  ko.components.register('drug-era-criteria', drugEra)

  const doseEra = require('./components/DoseEra')
  ko.components.register('dose-era-criteria', doseEra)

  const procedureOccurrence = require('./components/ProcedureOccurrence')
  ko.components.register('procedure-occurrence-criteria', procedureOccurrence)

  const observation = require('./components/Observation')
  ko.components.register('observation-criteria', observation)

  const visitOccurrence = require('./components/VisitOccurrence')
  ko.components.register('visit-occurrence-criteria', visitOccurrence)

  const visitDetail = require('./components/VisitDetail')
  ko.components.register('visit-detail-criteria', visitDetail)

  const deviceExposure = require('./components/DeviceExposure')
  ko.components.register('device-exposure-criteria', deviceExposure)

  const measurement = require('./components/Measurement')
  ko.components.register('measurement-criteria', measurement)

  const observationPeriod = require('./components/ObservationPeriod')
  ko.components.register('observation-period-criteria', observationPeriod)

  const specimen = require('./components/Specimen')
  ko.components.register('specimen-criteria', specimen)

  const death = require('./components/Death')
  ko.components.register('death-criteria', death)

  const demographicCriteria = require('./components/DemographicCriteria')
  ko.components.register('demographic-criteria', demographicCriteria)

  const numericRange = require('./components/NumericRange')
  ko.components.register('numeric-range', numericRange)

  const dateRange = require('./components/DateRange')
  ko.components.register('date-range', dateRange)

  const dateAdjustment = require('./components/DateAdjustment')
  ko.components.register('date-adjustment', dateAdjustment)

  const windowInput = require('./components/WindowInput')
  ko.components.register('window-input', windowInput)

  const textFilter = require('./components/TextFilter')
  ko.components.register('text-filter-input', textFilter)

  const periodInput = require('./components/Period')
  ko.components.register('period-input', periodInput)

  const cycleToggleInput = require('./components/CycleToggleInput')
  ko.components.register('cycle-toggle-input', cycleToggleInput)

  const conceptList = require('./components/ConceptList')
  ko.components.register('concept-list', conceptList)

  const endStrategyEditor = require('./components/EndStrategyEditor')
  ko.components.register('end-strategy-editor', endStrategyEditor)

  const conceptSetPreview = require('./components/ConceptSetQuickview')
  ko.components.register('conceptset-quickview', conceptSetPreview)

  const payerPlanPeriod = require('./components/PayerPlanPeriod')
  ko.components.register('payer-plan-period-criteria', payerPlanPeriod)

  const locationRegion = require('./components/LocationRegion')
  ko.components.register('location-region-criteria', locationRegion)

  require('./components/WindowedCriteria')
})
