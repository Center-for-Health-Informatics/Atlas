import ko from 'knockout'

class TargetOutcomes {
  constructor (data = {}) {
    this.targetId = ko.observable(data.targetId || null)
    this.outcomeIds = ko.observableArray((data.outcomeIds && Array.isArray(data.outcomeIds)) ? data.outcomeIds : [])
  }
}

export default TargetOutcomes
