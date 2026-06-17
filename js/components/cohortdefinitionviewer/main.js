import ko from 'knockout'
import commonUtils from 'utils/CommonUtils'
import expressionViewer from './components/CohortExpressionViewer'
import criteriaGroup from './components/CriteriaGroup'
import conditionOccurrence from './components/ConditionOccurrence'
import conditionEra from './components/ConditionEra'
import drugExposure from './components/DrugExposure'
import drugEra from './components/DrugEra'
import doseEra from './components/DoseEra'
import procedureOccurrence from './components/ProcedureOccurrence'
import observation from './components/Observation'
import visitDetail from './components/VisitDetail'
import visitOccurrence from './components/VisitOccurrence'
import deviceExposure from './components/DeviceExposure'
import measurement from './components/Measurement'
import observationPeriod from './components/ObservationPeriod'
import specimen from './components/Specimen'
import death from './components/Death'
import demographicCriteria from './components/DemographicCriteria'
import numericRange from './components/NumericRange'
import dateRange from './components/DateRange'
import periodInput from './components/Period'
import windowInput from './components/WindowInput'
import textFilter from './components/TextFilter'
import cycleToggleInput from './components/CycleToggleInput'
import conceptList from './components/ConceptList'
import conceptSetReference from './components/ConceptSetReference'
import dateAdjustment from './components/DateAdjustment'
import conceptSetViewer from './components/ConceptSetViewer'
import endStrategyViewer from './components/EndStrategyViewer'
import payerPlanPeriod from './components/PayerPlanPeriod'
import locationRegion from './components/LocationRegion'

ko.components.register('cohort-expression-viewer', expressionViewer)

ko.components.register('criteria-group-viewer', criteriaGroup)

ko.components.register('condition-occurrence-criteria-viewer', conditionOccurrence)

ko.components.register('condition-era-criteria-viewer', conditionEra)

ko.components.register('drug-exposure-criteria-viewer', drugExposure)

ko.components.register('drug-era-criteria-viewer', drugEra)

ko.components.register('dose-era-criteria-viewer', doseEra)

ko.components.register('procedure-occurrence-criteria-viewer', procedureOccurrence)

ko.components.register('observation-criteria-viewer', observation)

ko.components.register('visit-detail-criteria-viewer', visitDetail)

ko.components.register('visit-occurrence-criteria-viewer', visitOccurrence)

ko.components.register('device-exposure-criteria-viewer', deviceExposure)

ko.components.register('measurement-criteria-viewer', measurement)

ko.components.register('observation-period-criteria-viewer', observationPeriod)

ko.components.register('specimen-criteria-viewer', specimen)

ko.components.register('death-criteria-viewer', death)

ko.components.register('demographic-criteria-viewer', demographicCriteria)

ko.components.register('numeric-range-viewer', numericRange)

ko.components.register('date-range-viewer', dateRange)

ko.components.register('period-viewer', periodInput)

ko.components.register('window-input-viewer', windowInput)

ko.components.register('text-filter-viewer', textFilter)

ko.components.register('cycle-toggle-input-viewer', cycleToggleInput)

ko.components.register('concept-list-viewer', conceptList)

ko.components.register('conceptset-reference', conceptSetReference)

ko.components.register('date-adjustment-viewer', dateAdjustment)

commonUtils.build('conceptset-viewer', conceptSetViewer.viewModel, conceptSetViewer.template)

ko.components.register('end-strategy-viewer', endStrategyViewer)

ko.components.register('payer-plan-period-criteria-viewer', payerPlanPeriod)

ko.components.register('location-region-viewer', locationRegion)
