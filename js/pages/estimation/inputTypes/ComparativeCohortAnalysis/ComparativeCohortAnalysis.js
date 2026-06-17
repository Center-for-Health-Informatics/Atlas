import ko from 'knockout'
import TargetComparatorOutcomes from '../TargetComparatorOutcomes'
import CohortMethodAnalysis from './CohortMethodAnalysis'

class ComparativeCohortAnalysis {
  constructor (data = {}, defaultCovariateSettings) {
    this.targetComparatorOutcomes = ko.observableArray(data.targetComparatorOutcomes && data.targetComparatorOutcomes.map(function (d) { return new TargetComparatorOutcomes(d) }))
    this.cohortMethodAnalysisList = ko.observableArray(data.cohortMethodAnalysisList && data.cohortMethodAnalysisList.map(function (d) { return new CohortMethodAnalysis(d, defaultCovariateSettings) }))
  }
}

export default ComparativeCohortAnalysis

