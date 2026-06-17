import ko from 'knockout'
import view from './prediction-covariate-settings-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import dataTypeConverterUtils from 'utils/DataTypeConverterUtils'
import constants from '../../const'
import ConceptSet from 'services/analysis/ConceptSet'
import 'databindings'
import 'featureextraction/components/covariate-settings-editor'
import 'circe'

class PredictionCovariateSettingsEditor extends Component {
  constructor (params) {
    super(params)

    this.covariateSettings = params.covariateSettings
    this.options = constants.options
    this.subscriptions = params.subscriptions
    this.currentConceptSet = ko.observable(null)
    this.showConceptSetSelector = ko.observable(false)
    this.includedCovariateIds = ko.observable(this.covariateSettings.includedCovariateIds() && this.covariateSettings.includedCovariateIds().length > 0 ? this.analysis.getDbCohortMethodDataArgs.covariateSettings.includedCovariateIds().join() : '')
    this.isEditPermitted = params.isEditPermitted
    this.subscriptions.push(this.includedCovariateIds.subscribe(newValue => {
      this.covariateSettings.includedCovariateIds(dataTypeConverterUtils.commaDelimitedListToNumericArray(newValue))
    }))
  }

  conceptsetSelected (d) {
    this.currentConceptSet()(new ConceptSet({ id: d.id, name: d.name }))
    this.showConceptSetSelector(false)
  }

  chooseIncludedCovariates () {
    this.showConceptSetSelector(true)
    this.currentConceptSet(this.covariateSettings.includedCovariateConceptSet)
  }

  clearIncludedCovariates () {
    this.covariateSettings.includedCovariateConceptSet(new ConceptSet())
  }

  chooseExcludedCovariates () {
    this.showConceptSetSelector(true)
    this.currentConceptSet(this.covariateSettings.excludedCovariateConceptSet)
  }

  clearExcludedCovariates () {
    this.covariateSettings.excludedCovariateConceptSet(new ConceptSet())
  }
}

export default commonUtils.build('prediction-covar-settings-editor', PredictionCovariateSettingsEditor, view)

