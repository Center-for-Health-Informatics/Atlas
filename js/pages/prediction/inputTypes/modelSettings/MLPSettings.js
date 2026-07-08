import ko from 'knockout'
import 'databindings'

class MLPSettings {
  constructor (data = {}) {
    this.size = ko.observableArray((data.size && Array.isArray(data.size)) ? data.size.slice() : [4])
    this.alpha = ko.observableArray((data.alpha && Array.isArray(data.alpha)) ? data.alpha.slice() : [0.00001])
    this.seed = ko.observable(data.seed || null)
  }
}

export default MLPSettings
