import ko from 'knockout'
import view from './decision-tree-settings.html?raw'
import ModelSettingsEditorComponent from './ModelSettingsEditorComponent'
import commonUtils from 'utils/CommonUtils'
import dataTypeConverterUtils from 'utils/DataTypeConverterUtils'
import './decision-tree-settings.less'

const settings = {
  maxDepth: 'maxDepth',
  minSamplesSplit: 'minSamplesSplit',
  minSamplesLeaf: 'minSamplesLeaf',
  minImpurityDecrease: 'minImpurityDecrease',
  classWeight: 'classWeight',
}

class DecisionTreeSettings extends ModelSettingsEditorComponent {
  constructor (params) {
    super(params)

    this.maxDepth = {
      name: settings.maxDepth,
      value: this.modelSettings.maxDepth,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.maxDepth),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.maxDepth),
    }
    this.minSamplesSplit = {
      name: settings.minSamplesSplit,
      value: this.modelSettings.minSamplesSplit,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.minSamplesSplit),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.minSamplesSplit),
    }
    this.minSamplesLeaf = {
      name: settings.minSamplesLeaf,
      value: this.modelSettings.minSamplesLeaf,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.minSamplesLeaf),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.minSamplesLeaf),
    }
    this.minImpurityDecrease = {
      name: settings.minImpurityDecrease,
      value: this.modelSettings.minImpurityDecrease,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.minImpurityDecrease),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.minImpurityDecrease),
    }
    this.classWeight = {
      name: settings.classWeight,
      value: this.modelSettings.classWeight,
      valueLabel: this.utils.getDefaultModelSettingName(this.defaultModelSettings, settings.classWeight),
      default: this.utils.getDefaultModelSettingValue(this.defaultModelSettings, settings.classWeight),
    }
  }
}

export default commonUtils.build('decision-tree-settings', DecisionTreeSettings, view)
