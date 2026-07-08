import ko from 'knockout'
import view from './positive-control-sythesis-settings-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import constants from 'const'
import estimationConstants from '../../const'
import dataTypeConverterUtils from 'utils/DataTypeConverterUtils'
import 'databindings'
import 'cyclops'

class PositiveControlSythesisSettingsEditor extends Component {
  constructor (params) {
    super(params)

    this.settings = params.settings
    this.constants = constants
    this.options = estimationConstants.options.positiveControlSynthesisArgs
    this.subscriptions = params.subscriptions
    this.showCovariateSelector = ko.observable(false)
    this.showAdditionalSettings = ko.observable(false)
    this.effectSizes = ko.observable(this.settings().effectSizes() && this.settings().effectSizes().length > 0 ? this.settings().effectSizes().join() : '')
    this.isEditPermitted = params.isEditPermitted

    this.subscriptions.push(this.effectSizes.subscribe(newValue => {
      this.settings().effectSizes(dataTypeConverterUtils.commaDelimitedListToNumericArray(newValue))
    }))
  }

  toggleAdditionalSettings () {
    this.showAdditionalSettings(!this.showAdditionalSettings())
  }
}

export default commonUtils.build('positive-control-synthesis-settings-editor', PositiveControlSythesisSettingsEditor, view)
