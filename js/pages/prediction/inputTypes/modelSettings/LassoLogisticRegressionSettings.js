import ko from 'knockout'
import 'databindings'

class LassoLogisticRegressionSettings {
  constructor (data = {}) {
    this.variance = ko.observable(data.variance === 0 ? 0 : data.variance || 0.01).extend({ numeric: 9 })
    this.seed = ko.observable(data.seed || null)
  }
}

export default LassoLogisticRegressionSettings
