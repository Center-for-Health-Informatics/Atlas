import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import template from './DemographicCriteriaTemplate.html?raw'

function DemographicCriteriaViewModel (params) {
  const self = this
  self.Criteria = params.criteria
  self.expression = ko.utils.unwrapObservable(params.expression)
  self.options = options
}

// return compoonent definition
export { template }
export default { template }

