import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import template from './DoseEraTemplate.html?raw'

function DoseEraViewModel (params) {
  const self = this
  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.DoseEra
  self.options = options

  self.indexMessage = ko.i18nformat(
    'components.conditionDose.indexDataText',
    'The index date refers to the dose era of <%= conceptSetName %>.',
    {
      conceptSetName: ko.pureComputed(() => utils.getConceptSetName(
        self.Criteria.CodesetId,
        self.expression.ConceptSets,
        ko.i18n('components.conditionDose.anyDoseEra', 'Any Dose Era')
      ))
    }
  )
}

// return compoonent definition
export { template }
export default { template }

