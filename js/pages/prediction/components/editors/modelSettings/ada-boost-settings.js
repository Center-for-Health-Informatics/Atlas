import ko from 'knockout'
import view from './ada-boost-settings.html?raw'
import ModelSettingsEditorComponent from './ModelSettingsEditorComponent'
import commonUtils from 'utils/CommonUtils'
import dataTypeConverterUtils from 'utils/DataTypeConverterUtils'

const settings = {
  learningRate: 'learningRate',
  nEstimators: 'nEstimators'
}

class AdaBoostSettings extends ModelSettingsEditorComponent {
  constructor (params) {
    super(params)

    this.learningRate = {
      name: settings.learningRate,
      value: this.modelSettings.learningRate,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.learningRate),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.learningRate),
    }
    this.nEstimators = {
      name: settings.nEstimators,
      value: this.modelSettings.nEstimators,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.nEstimators),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.nEstimators),
    }
  }
}

export default commonUtils.build('ada-boost-settings', AdaBoostSettings, view)
