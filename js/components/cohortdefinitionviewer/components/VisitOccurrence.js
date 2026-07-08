import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import Range from 'components/cohortbuilder/InputTypes/Range'
import template from './VisitOccurrenceTemplate.html?raw'

function VisitOccurrenceViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.VisitOccurrence
  self.options = options

  self.indexMessage = ko.i18nformat(
    'components.conditionVisit.indexDataText',
    'The index date refers to the visit of <%= conceptSetName %>.',
    {
      conceptSetName: ko.pureComputed(() => utils.getConceptSetName(
        self.Criteria.CodesetId,
        self.expression.ConceptSets,
        ko.i18n('components.conditionVisit.anyVisit', 'Any Visit')
      ))
    }
  )
}

// return compoonent definition
export { VisitOccurrenceViewModel, template }
export default { viewModel: VisitOccurrenceViewModel, template }

