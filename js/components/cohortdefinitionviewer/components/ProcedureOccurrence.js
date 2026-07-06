import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import template from './ProcedureOccurrenceTemplate.html?raw'

function ProcedureOccurrenceViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.ProcedureOccurrence
  self.options = options

  self.indexMessage = ko.i18nformat(
    'components.conditionProcedureOccurrence.indexDataText',
    'The index date refers to the procedure of <%= conceptSetName %>.',
    {
      conceptSetName: ko.pureComputed(() => utils.getConceptSetName(
        self.Criteria.CodesetId,
        self.expression.ConceptSets,
        ko.i18n('components.conditionProcedureOccurrence.anyProcedure', 'Any Procedure')
      ))
    }
  )
}

// return compoonent definition
export { template }
export default { template }

