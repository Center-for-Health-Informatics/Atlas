import ko from 'knockout'
import 'databindings'

class GetDbPLPDataArgs {
  constructor (data = {}) {
    this.washoutPeriod = ko.observable(data.washoutPeriod === 0 ? 0 : data.washoutPeriod || 0).extend({ numeric: 0 })
    this.maxSampleSize = ko.observable(data.maxSampleSize || null)
  }
}

export default GetDbPLPDataArgs
