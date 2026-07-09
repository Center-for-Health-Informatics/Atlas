import view from './mlp-settings.html?raw'
import ModelSettingsEditorComponent from './ModelSettingsEditorComponent'
import commonUtils from 'utils/CommonUtils'

const settings = {
  size: 'size',
  alpha: 'alpha',
}

class MLPSettings extends ModelSettingsEditorComponent {
  constructor (params) {
    super(params)

    this.size = {
      name: settings.size,
      value: this.modelSettings.size,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.size),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.size),
    }

    this.alpha = {
      name: settings.alpha,
      value: this.modelSettings.alpha,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.alpha),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.alpha),
    }
  }
}

export default commonUtils.build('mlp-settings', MLPSettings, view)
