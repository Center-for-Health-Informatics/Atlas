define(function (require, exports) {
  const ko = require('knockout')
  const commonUtils = require('utils/CommonUtils')

  const expressionViewer = require('./components/CohortExpressionViewer')
  ko.components.register('cohort-expression-viewer', expressionViewer)

  const criteriaGroup = require('./components/CriteriaGroup')
  ko.components.register('criteria-group-viewer', criteriaGroup)

  const conditionOccurrence = require('./components/ConditionOccurrence')
  ko.components.register('condition-occurrence-criteria-viewer', conditionOccurrence)

  const conditionEra = require('./components/ConditionEra')
  ko.components.register('condition-era-criteria-viewer', conditionEra)

  const drugExposure = require('./components/DrugExposure')
  ko.components.register('drug-exposure-criteria-viewer', drugExposure)

  const drugEra = require('./components/DrugEra')
  ko.components.register('drug-era-criteria-viewer', drugEra)

  const doseEra = require('./components/DoseEra')
  ko.components.register('dose-era-criteria-viewer', doseEra)

  const procedureOccurrence = require('./components/ProcedureOccurrence')
  ko.components.register('procedure-occurrence-criteria-viewer', procedureOccurrence)

  const observation = require('./components/Observation')
  ko.components.register('observation-criteria-viewer', observation)

  const visitDetail = require('./components/VisitDetail')
  ko.components.register('visit-detail-criteria-viewer', visitDetail)

  const visitOccurrence = require('./components/VisitOccurrence')
  ko.components.register('visit-occurrence-criteria-viewer', visitOccurrence)

  const deviceExposure = require('./components/DeviceExposure')
  ko.components.register('device-exposure-criteria-viewer', deviceExposure)

  const measurement = require('./components/Measurement')
  ko.components.register('measurement-criteria-viewer', measurement)

  const observationPeriod = require('./components/ObservationPeriod')
  ko.components.register('observation-period-criteria-viewer', observationPeriod)

  const specimen = require('./components/Specimen')
  ko.components.register('specimen-criteria-viewer', specimen)

  const death = require('./components/Death')
  ko.components.register('death-criteria-viewer', death)

  const demographicCriteria = require('./components/DemographicCriteria')
  ko.components.register('demographic-criteria-viewer', demographicCriteria)

  const numericRange = require('./components/NumericRange')
  ko.components.register('numeric-range-viewer', numericRange)

  const dateRange = require('./components/DateRange')
  ko.components.register('date-range-viewer', dateRange)

  const periodInput = require('./components/Period')
  ko.components.register('period-viewer', periodInput)

  const windowInput = require('./components/WindowInput')
  ko.components.register('window-input-viewer', windowInput)

  const textFilter = require('./components/TextFilter')
  ko.components.register('text-filter-viewer', textFilter)

  const cycleToggleInput = require('./components/CycleToggleInput')
  ko.components.register('cycle-toggle-input-viewer', cycleToggleInput)

  const conceptList = require('./components/ConceptList')
  ko.components.register('concept-list-viewer', conceptList)

  const conceptSetReference = require('./components/ConceptSetReference')
  ko.components.register('conceptset-reference', conceptSetReference)

  const dateAdjustment = require('./components/DateAdjustment')
  ko.components.register('date-adjustment-viewer', dateAdjustment)

  const conceptSetViewer = require('./components/ConceptSetViewer')
  commonUtils.build('conceptset-viewer', conceptSetViewer.viewModel, conceptSetViewer.template)

  const endStrategyViewer = require('./components/EndStrategyViewer')
  ko.components.register('end-strategy-viewer', endStrategyViewer)

  const payerPlanPeriod = require('./components/PayerPlanPeriod')
  ko.components.register('payer-plan-period-criteria-viewer', payerPlanPeriod)

  const locationRegion = require('./components/LocationRegion')
  ko.components.register('location-region-viewer', locationRegion)
})
