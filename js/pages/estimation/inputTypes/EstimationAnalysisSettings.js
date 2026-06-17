import ko from 'knockout'
import ComparativeCohortAnalysis from './ComparativeCohortAnalysis/ComparativeCohortAnalysis'

class EstimationAnalysisSettings {
  constructor (data = {}, estimationType, defaultCovariateSettings) {
    this.estimationType = (data.estimationType || estimationType)
    this.analysisSpecification = this.getAnalysisObject(this.estimationType, data.analysisSpecification, defaultCovariateSettings)
  }

  getAnalysisObject (estimationType, analysisSpecification, defaultCovariateSettings) {
    if (estimationType === 'ComparativeCohortAnalysis') {
      return new ComparativeCohortAnalysis(analysisSpecification, defaultCovariateSettings)
    } else {
      console.error('estimationType property not set on Estimation Analysis and cannot initialize properly.')
    }
  }
}

export default EstimationAnalysisSettings

