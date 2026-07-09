import ko from 'knockout'
import template from './EndStrategyViewerTemplate.html?raw'
import dateOffsetStrategyComponent from './DateOffsetStrategy'
import customEraStrategyComponent from './CustomEraStrategy'

ko.components.register('date-offset-strategy-viewer', dateOffsetStrategyComponent)
ko.components.register('custom-era-strategy-viewer', customEraStrategyComponent)

function EndStrategyViewerViewModel (params) {
  const self = this

  self.strategy = params.strategy
  self.conceptSets = params.conceptSets

  self.strategyComponentName = ko.pureComputed(function () {
    const strategy = ko.utils.unwrapObservable(params.strategy)
    if (Object.prototype.hasOwnProperty.call(strategy, 'DateOffset')) { return 'date-offset-strategy-viewer' } else if (Object.prototype.hasOwnProperty.call(strategy, 'CustomEra')) { return 'custom-era-strategy-viewer' } else { return 'unknown-strategy-viewer' }
  })
}

// return compoonent definition
export { EndStrategyViewerViewModel, template }
export default { viewModel: EndStrategyViewerViewModel, template }
