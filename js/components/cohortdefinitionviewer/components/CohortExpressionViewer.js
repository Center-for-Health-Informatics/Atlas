import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import template from './CohortExpressionViewerTemplate.html?raw'

function CohortExpressionEditorViewModel (params) {
  const self = this

  self.expression = params.expression
  self.options = options

  self.getLimitTypeText = function (typeId) {
    return options.resultLimitOptions.filter(function (item) {
      return item.id === typeId
    })[0].name
  }
  self.getCriteriaIndexComponent = function (data) {
    data = ko.utils.unwrapObservable(data)
    const hasOwn = (key) => Object.prototype.hasOwnProperty.call(data, key)
    if (hasOwn('ConditionOccurrence')) { return 'condition-occurrence-criteria-viewer' } else if (hasOwn('ConditionEra')) { return 'condition-era-criteria-viewer' } else if (hasOwn('DrugExposure')) { return 'drug-exposure-criteria-viewer' } else if (hasOwn('DrugEra')) { return 'drug-era-criteria-viewer' } else if (hasOwn('DoseEra')) { return 'dose-era-criteria-viewer' } else if (hasOwn('ProcedureOccurrence')) { return 'procedure-occurrence-criteria-viewer' } else if (hasOwn('Observation')) { return 'observation-criteria-viewer' } else if (hasOwn('VisitOccurrence')) { return 'visit-occurrence-criteria-viewer' } else if (hasOwn('VisitDetail')) { return 'visit-detail-criteria-viewer' } else if (hasOwn('DeviceExposure')) { return 'device-exposure-criteria-viewer' } else if (hasOwn('Measurement')) { return 'measurement-criteria-viewer' } else if (hasOwn('Specimen')) { return 'specimen-criteria-viewer' } else if (hasOwn('ObservationPeriod')) { return 'observation-period-criteria-viewer' } else if (hasOwn('PayerPlanPeriod')) { return 'payer-plan-period-criteria-viewer' } else if (hasOwn('Death')) { return 'death-criteria-viewer' } else if (hasOwn('LocationRegion')) { return 'location-region-viewer' } else { return 'unknownCriteriaType' }
  }

  self.showCensorWindow = ko.observable(
    self.expression().CensorWindow().StartDate() ||
    self.expression().CensorWindow().EndDate()
  )
}

// return factory
export { CohortExpressionEditorViewModel, template }
export default { viewModel: CohortExpressionEditorViewModel, template }
