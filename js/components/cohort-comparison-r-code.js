import $ from 'jquery'
import ko from 'knockout'
import view from './cohort-comparison-r-code.html?raw'
import config from 'appConfig'
import cohortComparison from 'components/cohortcomparison/ComparativeCohortAnalysis'
import vocabularyAPI from 'services/VocabularyProvider'

function cohortComparisonRCode (params) {
  const self = this
  self.config = config
  self.cohortComparison = params.cohortComparison
}

const component = {
  viewModel: cohortComparisonRCode,
  template: view
}

ko.components.register('cohort-comparison-r-code', component)
export default component

