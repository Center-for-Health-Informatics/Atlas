import ConditionOccurrence from './CriteriaTypes/ConditionOccurrence'
import ConditionEra from './CriteriaTypes/ConditionEra'
import DrugExposure from './CriteriaTypes/DrugExposure'
import DrugEra from './CriteriaTypes/DrugEra'
import DoseEra from './CriteriaTypes/DoseEra'
import Observation from './CriteriaTypes/Observation'
import ProcedureOccurrence from './CriteriaTypes/ProcedureOccurrence'
import Specimen from './CriteriaTypes/Specimen'
import VisitOccurrence from './CriteriaTypes/VisitOccurrence'
import VisitDetail from './CriteriaTypes/VisitDetail'
import DeviceExposure from './CriteriaTypes/DeviceExposure'
import Measurement from './CriteriaTypes/Measurement'
import ObservationPeriod from './CriteriaTypes/ObservationPeriod'
import Death from './CriteriaTypes/Death'
import DemographicCriteria from './CriteriaTypes/DemographicCriteria'
import PayerPlanPeriod from './CriteriaTypes/PayerPlanPeriod'
import LocationRegion from './CriteriaTypes/LocationRegion'

function GetCriteriaFromObject (data, conceptSets) {
  if (Object.prototype.hasOwnProperty.call(data, 'ConditionOccurrence')) {
    return { ConditionOccurrence: new ConditionOccurrence(data.ConditionOccurrence, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'ConditionEra')) {
    return { ConditionEra: new ConditionEra(data.ConditionEra, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'DrugExposure')) {
    return { DrugExposure: new DrugExposure(data.DrugExposure, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'DrugEra')) {
    return { DrugEra: new DrugEra(data.DrugEra, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'DoseEra')) {
    return { DoseEra: new DoseEra(data.DoseEra, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'Observation')) {
    return { Observation: new Observation(data.Observation, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'ProcedureOccurrence')) {
    return { ProcedureOccurrence: new ProcedureOccurrence(data.ProcedureOccurrence, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'VisitOccurrence')) {
    return { VisitOccurrence: new VisitOccurrence(data.VisitOccurrence, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'VisitDetail')) {
    return { VisitDetail: new VisitDetail(data.VisitDetail, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'DeviceExposure')) {
    return { DeviceExposure: new DeviceExposure(data.DeviceExposure, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'Measurement')) {
    return { Measurement: new Measurement(data.Measurement, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'ObservationPeriod')) {
    return { ObservationPeriod: new ObservationPeriod(data.ObservationPeriod, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'Specimen')) {
    return { Specimen: new Specimen(data.Specimen, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'Death')) {
    return { Death: new Death(data.Death, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'PayerPlanPeriod')) {
    return { PayerPlanPeriod: new PayerPlanPeriod(data.PayerPlanPeriod, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'LocationRegion')) {
    return { LocationRegion: new LocationRegion(data.LocationRegion, conceptSets) }
  }
}

export {
  GetCriteriaFromObject,
  ConditionOccurrence, ConditionEra, DrugExposure, DrugEra, DoseEra,
  Observation, ProcedureOccurrence, Specimen, VisitOccurrence, VisitDetail,
  DeviceExposure, Measurement, ObservationPeriod, Death, DemographicCriteria,
  PayerPlanPeriod, LocationRegion,
}
export default {
  GetCriteriaFromObject,
  ConditionOccurrence,
  ConditionEra,
  DrugExposure,
  DrugEra,
  DoseEra,
  Observation,
  ProcedureOccurrence,
  Specimen,
  VisitOccurrence,
  VisitDetail,
  DeviceExposure,
  Measurement,
  ObservationPeriod,
  Death,
  DemographicCriteria,
  PayerPlanPeriod,
  LocationRegion,
}
