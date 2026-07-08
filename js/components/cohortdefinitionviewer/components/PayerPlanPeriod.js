import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import template from './PayerPlanPeriodTemplate.html?raw'

function PayerPlanPeriodViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.PayerPlanPeriod
  self.options = options

  self.indexMessage = ko.i18n('components.conditionPayerPlanPeriod.indexDataText', 'The index date refers to the payer plan period.')
}

export { PayerPlanPeriodViewModel, template }
export default { viewModel: PayerPlanPeriodViewModel, template }

