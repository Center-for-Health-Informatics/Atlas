import ko from 'knockout'

class FullAnalysis {
  constructor (targetComparatorOutcome, cohortMethodAnalysis) {
    this.targetComparatorOutcome = targetComparatorOutcome || null
    this.cohortMethodAnalysis = cohortMethodAnalysis || null
  }
}

export default FullAnalysis
