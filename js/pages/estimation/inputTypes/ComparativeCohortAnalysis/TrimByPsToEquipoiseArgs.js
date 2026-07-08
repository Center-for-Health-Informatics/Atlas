import ko from 'knockout'
import RLangClass from 'services/analysis/RLangClass'
import 'databindings'

class TrimByPsToEquipoiseArgs extends RLangClass {
  constructor (data = {}) {
    super()
    this.bounds = ko.observableArray(data.bounds || [0.25, 0.75])
  }
}

export default TrimByPsToEquipoiseArgs
