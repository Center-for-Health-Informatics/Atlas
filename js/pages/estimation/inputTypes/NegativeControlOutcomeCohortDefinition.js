import ko from 'knockout'

class NegativeControlOutcomeCohortDefinition {
  constructor (data = {}) {
    this.occurrenceType = ko.observable(data.occurrenceType || 'all')
    this.detectOnDescendants = ko.observable(data.detectOnDescendants || true)
    this.domains = ko.observableArray(data.domains && data.domains.map(function (d) { return d }) || ['condition', 'procedure'])
  }
}

export default NegativeControlOutcomeCohortDefinition

