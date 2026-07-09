import view from './lasso-logistic-regression-settings.html?raw'
import ModelSettingsEditorComponent from './ModelSettingsEditorComponent'
import commonUtils from 'utils/CommonUtils'

class LassoLogisticRegressionSettings extends ModelSettingsEditorComponent {
  constructor (params) {
    super(params)

    this.variance = {
      name: 'variance',
      value: this.modelSettings.variance,
    }
  }
}

export default commonUtils.build('lasso-logistic-regression-settings', LassoLogisticRegressionSettings, view)
