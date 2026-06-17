import ko from 'knockout'
import CovariateSettings from 'featureextraction/InputTypes/CovariateSettings'
import ConceptSet from 'services/analysis/ConceptSet'

class PredictionCovariateSettings extends CovariateSettings {
  constructor (data) {
    super(data)
    this.includedCovariateConceptSet = ko.observable(data.includedCovariateConceptSet !== null ? new ConceptSet(data.includedCovariateConceptSet) : new ConceptSet())
    this.excludedCovariateConceptSet = ko.observable(data.excludedCovariateConceptSet !== null ? new ConceptSet(data.excludedCovariateConceptSet) : new ConceptSet())
  }
}
export default PredictionCovariateSettings

