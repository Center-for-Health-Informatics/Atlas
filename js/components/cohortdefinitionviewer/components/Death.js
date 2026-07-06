import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import template from './DeathTemplate.html?raw'

function DeathViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.Death
  self.options = options

  self.indexMessage = ko.i18nformat(
    'components.conditionDeath.indexDataText',
    'The index date refers to the death event of <%= conceptSetName %>.',
    {
      conceptSetName: ko.pureComputed(() => utils.getConceptSetName(
        self.Criteria.CodesetId,
        self.expression.ConceptSets,
        ko.i18n('components.conditionDeath.anyDeath', 'Any Death')
      ))
    }
  )
}

// return compoonent definition
export { template }
export default { template }

