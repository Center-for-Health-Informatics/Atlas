import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import template from './CriteriaGroupTemplate.html?raw'

function CriteriaGroupViewModel (params) {
  const self = this

  self.expression = params.expression
  self.group = params.group
  self.parentGroup = params.parentGroup
  self.options = options
  self.indexMessage = params.indexMessage

  self.getCriteriaComponent = function (data) {
    const has = (key) => Object.prototype.hasOwnProperty.call(data, key)
    if (has('ConditionOccurrence')) { return 'condition-occurrence-criteria-viewer' } else if (has('ConditionEra')) { return 'condition-era-criteria-viewer' } else if (has('DrugExposure')) { return 'drug-exposure-criteria-viewer' } else if (has('DrugEra')) { return 'drug-era-criteria-viewer' } else if (has('DoseEra')) { return 'dose-era-criteria-viewer' } else if (has('PayerPlanPeriod')) { return 'payer-plan-period-criteria-viewer' } else if (has('ProcedureOccurrence')) { return 'procedure-occurrence-criteria-viewer' } else if (has('VisitOccurrence')) { return 'visit-occurrence-criteria-viewer' } else if (has('VisitDetail')) { return 'visit-detail-criteria-viewer' } else if (has('Observation')) { return 'observation-criteria-viewer' } else if (has('DeviceExposure')) { return 'device-exposure-criteria-viewer' } else if (has('Measurement')) { return 'measurement-criteria-viewer' } else if (has('Specimen')) { return 'specimen-criteria-viewer' } else if (has('ObservationPeriod')) { return 'observation-period-criteria-viewer' } else if (has('Death')) { return 'death-criteria-viewer' } else if (has('LocationRegion')) { return 'location-region-viewer' } else { return 'unknown-criteria' }
  }

  self.groupType = ko.pureComputed(function () {
    return ko.unwrap(self.options.groupTypeOptions.find((item) =>
      self.group() && item.id === self.group().Type()
    ).name)
  })

  self.getOccurrenceType = function (occurenceType) {
    return ko.unwrap(self.options.occurrenceTypeOptions.find((item) =>
      item.id === occurenceType
    ).name)
  }
}

// return compoonent definition
export { CriteriaGroupViewModel, template }
export default { viewModel: CriteriaGroupViewModel, template }
