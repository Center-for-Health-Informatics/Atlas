import ko from 'knockout'
import RLangClass from 'services/analysis/RLangClass'
import 'databindings'

class TrimByPsArgs extends RLangClass {
  constructor (data = {}) {
    super()
    this.trimFraction = ko.observable(data.trimFraction === 0 ? 0 : data.trimFraction || 0.05).extend({ numeric: 2 })
  }
}

export default TrimByPsArgs

