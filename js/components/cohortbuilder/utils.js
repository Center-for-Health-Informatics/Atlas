import ko from 'knockout'

function getCriteriaComponent (data) {
  const hasOwn = (key) => Object.prototype.hasOwnProperty.call(data, key)
  if (hasOwn('ConditionOccurrence')) { return 'condition-occurrence-criteria' } else if (hasOwn('ConditionEra')) { return 'condition-era-criteria' } else if (hasOwn('DrugExposure')) { return 'drug-exposure-criteria' } else if (hasOwn('DrugEra')) { return 'drug-era-criteria' } else if (hasOwn('DoseEra')) { return 'dose-era-criteria' } else if (hasOwn('PayerPlanPeriod')) { return 'payer-plan-period-criteria' } else if (hasOwn('ProcedureOccurrence')) { return 'procedure-occurrence-criteria' } else if (hasOwn('VisitOccurrence')) { return 'visit-occurrence-criteria' } else if (hasOwn('VisitDetail')) { return 'visit-detail-criteria' } else if (hasOwn('Observation')) { return 'observation-criteria' } else if (hasOwn('DeviceExposure')) { return 'device-exposure-criteria' } else if (hasOwn('Measurement')) { return 'measurement-criteria' } else if (hasOwn('Specimen')) { return 'specimen-criteria' } else if (hasOwn('ObservationPeriod')) { return 'observation-period-criteria' } else if (hasOwn('Death')) { return 'death-criteria' } else if (hasOwn('LocationRegion')) { return 'location-region-criteria' } else { return 'unknown-criteria' }
}

function formatDropDownOption (option) {
  return '<div class="optionText">' + option.text + '</div>' +
'<div class="optionDescription">' + option.description + '</div>'
}

function getConceptSetName (conceptSetId, conceptSetList, defaultName) {
  const selectedConceptSet = conceptSetList().find(function (item) { return item.id === ko.utils.unwrapObservable(conceptSetId) })
  return ko.utils.unwrapObservable(selectedConceptSet && selectedConceptSet.name) || defaultName
}

export default {
  getCriteriaComponent,
  formatDropDownOption,
  getConceptSetName
}
