import ko from 'knockout'
import RLangClass from 'services/analysis/RLangClass'

class Analysis extends RLangClass {
  constructor (data = {}) {
    super(data)
    this.analysisId = ko.observable(data.analysisId === 0 ? 0 : data.analysisId || null)
    this.description = ko.observable(data.description || null)
  }
}

export default Analysis

