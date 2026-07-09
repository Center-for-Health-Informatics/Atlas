import ko from 'knockout'
import view from './cohort-comparison-multi-r-code.html?raw'
import config from 'appConfig'

function cohortComparisonMultiRCode (params) {
  const self = this
  self.config = config
  self.cohortComparison = params.cohortComparison
  self.codeElementId = params.codeElementId || 'estimation-r-code'
}

const component = {
  viewModel: cohortComparisonMultiRCode,
  template: view
}

ko.components.register('cohort-comparison-multi-r-code', component)
export default component
