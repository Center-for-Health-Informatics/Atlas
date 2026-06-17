import ko from 'knockout'
import expressionEditor from './components/CohortExpressionEditor'
import initialCriteriaEditor from './components/InitialCriteriaEditor'
import censoringCriteriaEditor from './components/CensoringCriteriaEditor'
import inclusionEditor from './components/InclusionRuleEditor'
import criteriaGroup from './components/CriteriaGroup'
import conditionOccurrence from './components/ConditionOccurrence'
import conditionEra from './components/ConditionEra'
import drugExposure from './components/DrugExposure'
import drugEra from './components/DrugEra'
import doseEra from './components/DoseEra'
import procedureOccurrence from './components/ProcedureOccurrence'
import observation from './components/Observation'
import visitOccurrence from './components/VisitOccurrence'
import visitDetail from './components/VisitDetail'
import deviceExposure from './components/DeviceExposure'
import measurement from './components/Measurement'
import observationPeriod from './components/ObservationPeriod'
import specimen from './components/Specimen'
import death from './components/Death'
import demographicCriteria from './components/DemographicCriteria'
import numericRange from './components/NumericRange'
import dateRange from './components/DateRange'
import dateAdjustment from './components/DateAdjustment'
import windowInput from './components/WindowInput'
import textFilter from './components/TextFilter'
import periodInput from './components/Period'
import cycleToggleInput from './components/CycleToggleInput'
import conceptList from './components/ConceptList'
import endStrategyEditor from './components/EndStrategyEditor'
import conceptSetPreview from './components/ConceptSetQuickview'
import payerPlanPeriod from './components/PayerPlanPeriod'
import locationRegion from './components/LocationRegion'
import './components/WindowedCriteria'

ko.components.register('cohort-expression-editor', expressionEditor)

ko.components.register('initial-criteria-editor', initialCriteriaEditor)

ko.components.register('censoring-criteria-editor', censoringCriteriaEditor)

ko.components.register('inclusion-rule-editor', inclusionEditor)

ko.components.register('criteria-group', criteriaGroup)

ko.components.register('condition-occurrence-criteria', conditionOccurrence)

ko.components.register('condition-era-criteria', conditionEra)

ko.components.register('drug-exposure-criteria', drugExposure)

ko.components.register('drug-era-criteria', drugEra)

ko.components.register('dose-era-criteria', doseEra)

ko.components.register('procedure-occurrence-criteria', procedureOccurrence)

ko.components.register('observation-criteria', observation)

ko.components.register('visit-occurrence-criteria', visitOccurrence)

ko.components.register('visit-detail-criteria', visitDetail)

ko.components.register('device-exposure-criteria', deviceExposure)

ko.components.register('measurement-criteria', measurement)

ko.components.register('observation-period-criteria', observationPeriod)

ko.components.register('specimen-criteria', specimen)

ko.components.register('death-criteria', death)

ko.components.register('demographic-criteria', demographicCriteria)

ko.components.register('numeric-range', numericRange)

ko.components.register('date-range', dateRange)

ko.components.register('date-adjustment', dateAdjustment)

ko.components.register('window-input', windowInput)

ko.components.register('text-filter-input', textFilter)

ko.components.register('period-input', periodInput)

ko.components.register('cycle-toggle-input', cycleToggleInput)

ko.components.register('concept-list', conceptList)

ko.components.register('end-strategy-editor', endStrategyEditor)

ko.components.register('conceptset-quickview', conceptSetPreview)

ko.components.register('payer-plan-period-criteria', payerPlanPeriod)

ko.components.register('location-region-criteria', locationRegion)
