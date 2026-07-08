import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import template from './ObservationTemplate.html?raw'

function ObservationViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.Observation
  self.options = options

  self.indexMessage = ko.i18nformat(
    'components.conditionObservation.indexDataText',
    'The index date refers to the observation of <%= conceptSetName %>.',
    {
      conceptSetName: ko.pureComputed(() => utils.getConceptSetName(
        self.Criteria.CodesetId,
        self.expression.ConceptSets,
        ko.i18n('components.conditionObservation.anyObservation', 'Any Observation')
      ))
    }
  )
}

// return compoonent definition
export { ObservationViewModel, template }
export default { viewModel: ObservationViewModel, template }

