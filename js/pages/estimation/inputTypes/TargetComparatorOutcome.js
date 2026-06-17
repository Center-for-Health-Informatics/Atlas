import Cohort from 'services/analysis/Cohort'

class TargetComparatorOutcome {
  constructor (data = {}) {
    this.target = data.target || new Cohort()
    this.comparator = data.comparator || new Cohort()
    this.outcome = data.outcome || new Cohort()
  }
}

export default TargetComparatorOutcome

