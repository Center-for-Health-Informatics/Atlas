import ko from 'knockout'
import template from './CustomEraStrategyTemplate.html?raw'

function CustomEraStrategyViewModel (params) {
  const self = this

  self.strategy = ko.pureComputed(function () {
    return ko.utils.unwrapObservable(params.strategy).CustomEra
  })

  self.conceptSets = params.conceptSets
}

// return compoonent definition
export { CustomEraStrategyViewModel, template }
export default { viewModel: CustomEraStrategyViewModel, template }
