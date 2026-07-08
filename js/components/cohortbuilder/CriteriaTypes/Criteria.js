import ko from 'knockout'
import Range from '../InputTypes/Range'
import Concept from 'conceptpicker/InputTypes/Concept'
import Text from '../InputTypes/Text'
import DateAdjustment from '../InputTypes/DateAdjustment'
import '../CriteriaGroup'
import CriteriaGroup from '../CriteriaGroup'

function Criteria (data, conceptSets) {
  const self = this
  data = data || {}

  self.CorrelatedCriteria = ko.observable(data.CorrelatedCriteria && new CriteriaGroup(data.CorrelatedCriteria, conceptSets))
  self.DateAdjustment = ko.observable(data.DateAdjustment && new DateAdjustment(data.DateAdjustment))
}

export default Criteria
