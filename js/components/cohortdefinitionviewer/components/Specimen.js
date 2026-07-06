import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import template from './SpecimenTemplate.html?raw'

function SpecimenViewModel (params) {
  const self = this
  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.Specimen
  self.options = options

  self.indexMessage = ko.i18nformat(
    'components.conditionSpecimen.indexDataText',
    'The index date refers to the specimen of <%= conceptSetName %>.',
    {
      conceptSetName: ko.pureComputed(() => utils.getConceptSetName(
        self.Criteria.CodesetId,
        self.expression.ConceptSets,
        ko.i18n('components.conditionSpecimen.anySpecimen', 'Any Specimen')
      ))
    }
  )
}

// return compoonent definition
export { template }
export default { template }

