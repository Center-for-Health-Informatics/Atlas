import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import template from './ObservationPeriodTemplate.html?raw'

function ObservationPeriodViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.ObservationPeriod
  self.options = options
}

// return compoonent definition
export { template }
export default { template }

