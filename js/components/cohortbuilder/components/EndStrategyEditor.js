import ko from 'knockout'
import template from './EndStrategyEditorTemplate.html?raw'
import * as strategies from '../EndStrategies'
import dateOffsetStrategyComponent from './DateOffsetStrategy'
import customEraStrategyComponent from './CustomEraStrategy'

ko.components.register('date-offset-strategy', dateOffsetStrategyComponent)
ko.components.register('custom-era-strategy', customEraStrategyComponent)

function EndStrategyEditorViewModel (params) {
  const self = this

  function getTypeFromStrategy (strategy) {
    if (strategy == null) return 'default'
    else if (Object.prototype.hasOwnProperty.call(strategy, 'DateOffset')) return 'dateOffset'
    else if (Object.prototype.hasOwnProperty.call(strategy, 'CustomEra')) return 'customEra'
    throw new Error('Strategy instance does not resolve to a StrategyType.')
  }

  function setStrategy (strategyType) {
    switch (strategyType) {
      case 'dateOffset':
        self.strategy({
          DateOffset: new strategies.DateOffset({}, self.conceptSets),
        })
        break
      case 'customEra':
        self.strategy({
          CustomEra: new strategies.CustomEra({}, self.conceptSets),
        })
        break
      case 'default':
        self.clearStrategy()
        break
      default:
    }
  }

  self.strategyOptions = [
    { name: 'default', text: ko.i18n('options.endOfContinuousObservation', 'end of continuous observation') },
    { name: 'dateOffset', text: ko.i18n('options.fixedDurationRelativeToInitialEvent', 'fixed duration relative to initial event') },
    { name: 'customEra', text: ko.i18n('options.endOfContinuousDrugExposure', 'end of a continuous drug exposure') },
  ]

  self.strategy = params.strategy
  self.conceptSets = params.conceptSets
  self.strategyType = ko.pureComputed({
    read: () => getTypeFromStrategy(self.strategy()),
    write: setStrategy,
  })

  self.clearStrategy = function () {
    self.strategy(null)
  }

  self.strategyComponentName = ko.pureComputed(function () {
    const strategy = ko.utils.unwrapObservable(params.strategy)
    if (Object.prototype.hasOwnProperty.call(strategy, 'DateOffset')) { return 'date-offset-strategy' } else if (Object.prototype.hasOwnProperty.call(strategy, 'CustomEra')) { return 'custom-era-strategy' } else return 'unknown-strategy'
  })

  self.subscriptions = []

  // subscriptions

  // cleanup
  self.dispose = function () {
    self.subscriptions.forEach(function (subscription) {
      subscription.dispose()
    })
  }
}

// return compoonent definition
export { EndStrategyEditorViewModel, template }
export default { viewModel: EndStrategyEditorViewModel, template }
