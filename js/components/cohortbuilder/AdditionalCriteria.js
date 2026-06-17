// AdditoinalCriteria.js - a wrapper for criteria that is used as Additional Criteria
import WindowedCriteria from './WindowedCriteria'
import Occurrence from './InputTypes/Occurrence'

class AdditionalCriteria extends WindowedCriteria {
  constructor (data, conceptSets) {
    super(data, conceptSets)
    this.Occurrence = new Occurrence(data.Occurrence)
  }
}

export default AdditionalCriteria

