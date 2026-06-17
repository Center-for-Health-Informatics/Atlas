import ko from 'knockout'

class TargetOutcome {
  constructor (data = {}) {
    this.targetId = data.targetId || null
    this.targetName = data.targetName || null
    this.outcomeId = data.outcomeId || null
    this.outcomeName = data.outcomeName || null
  }
}

export default TargetOutcome

