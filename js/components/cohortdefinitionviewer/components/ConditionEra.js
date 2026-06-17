import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import template from './ConditionEraTemplate.html?raw'

function ConditionEraViewModel (params) {
  const self = this
  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.ConditionEra
  self.options = options

  self.indexMessage = ko.pureComputed(() => {
    const anyCondition = ko.i18n('components.conditionEra.anyConditionButton', 'Any Condition')
    const message = ko.i18n('components.conditionEra.returnText_1', 'The index date refers to the condition era of')
    const conceptSetName = utils.getConceptSetName(
      self.Criteria.CodesetId,
      self.expression.ConceptSets,
      anyCondition()
    )
    return `${message()} ${conceptSetName}.`
  })
}

// return compoonent definition
export default {
  viewModel: ConditionEraViewModel,
  template
}

