import ko from 'knockout'
import view from './cohort-comparison-print-friendly.html?raw'
import config from 'appConfig'

function cohortComparisonPrintFriendly (params) {
  const self = this
  self.config = config
  self.loading = ko.observable(true)
  self.cohortComparison = params.cohortComparison
}

const component = {
  viewModel: cohortComparisonPrintFriendly,
  template: view
}

ko.components.register('cohort-comparison-print-friendly', component)
export default component
