import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import template from './ObservationPeriodTemplate.html?raw'

function ObservationPeriodViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.ObservationPeriod
  self.options = options
}

// return compoonent definition
export { ObservationPeriodViewModel, template }
export default { viewModel: ObservationPeriodViewModel, template }
