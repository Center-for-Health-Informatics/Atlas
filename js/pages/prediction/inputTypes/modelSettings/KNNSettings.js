import ko from 'knockout'
import 'databindings'

class KNNSettings {
  constructor (data = {}) {
    this.k = ko.observable(data.k === 0 ? 0 : data.k || 1000).extend({ numeric: 0 })
  }
}

export default KNNSettings
