import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import Range from 'components/cohortbuilder/InputTypes/Range'
import template from './DrugEraTemplate.html?raw'

function DrugEraViewModel (params) {
  const self = this
  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.DrugEra
  self.options = options

  self.indexMessage = ko.i18nformat(
    'components.conditionDrug.indexDataText',
    'The index date refers to the drug era of <%= conceptSetName %>.',
    {
      conceptSetName: ko.pureComputed(() => utils.getConceptSetName(
        self.Criteria.CodesetId,
        self.expression.ConceptSets,
        ko.i18n('components.conditionDrug.anyDrug', 'Any Drug')
      ))
    }
  )
}

// return compoonent definition
export { DrugEraViewModel, template }
export default { viewModel: DrugEraViewModel, template }

