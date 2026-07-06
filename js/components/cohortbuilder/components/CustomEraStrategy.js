import ko from 'knockout'
import template from './CustomEraStrategyTemplate.html?raw'
import options from '../options'

function CustomEraStrategyViewModel (params) {
  const self = this
  self.options = options

  self.strategy = ko.pureComputed(function () {
    return ko.utils.unwrapObservable(params.strategy).CustomEra
  })

  self.addDaysSupplyOverride = function () {
    self.strategy().DaysSupplyOverride(1)
  }

  self.removeDaysSupplyOverride = function () {
    self.strategy().DaysSupplyOverride(null)
  }

  self.conceptSets = params.conceptSets
}

// return compoonent definition
export { template }
export default { template }

