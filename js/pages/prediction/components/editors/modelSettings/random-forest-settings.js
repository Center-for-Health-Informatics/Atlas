import ko from 'knockout'
import view from './random-forest-settings.html?raw'
import ModelSettingsEditorComponent from './ModelSettingsEditorComponent'
import commonUtils from 'utils/CommonUtils'
import dataTypeConverterUtils from 'utils/DataTypeConverterUtils'

const settings = {
  mtries: 'mtries',
  ntrees: 'ntrees',
  maxDepth: 'maxDepth',
  varImp: 'varImp'
}

class RandomForestSettings extends ModelSettingsEditorComponent {
  constructor (params) {
    super(params)

    this.mtries = {
      name: settings.mtries,
      value: this.modelSettings.mtries,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.mtries),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.mtries),
    }
    this.ntrees = {
      name: settings.ntrees,
      value: this.modelSettings.ntrees,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.ntrees),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.ntrees),
    }
    this.maxDepth = {
      name: settings.maxDepth,
      value: this.modelSettings.maxDepth,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.maxDepth),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.maxDepth),
    }
    this.varImp = {
      name: settings.varImp,
      value: this.modelSettings.varImp,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.varImp),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.varImp),
    }
  }
}

export default commonUtils.build('random-forest-settings', RandomForestSettings, view)
