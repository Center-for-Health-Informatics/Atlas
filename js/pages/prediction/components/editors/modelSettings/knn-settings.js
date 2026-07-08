import ko from 'knockout'
import view from './knn-settings.html?raw'
import ModelSettingsEditorComponent from './ModelSettingsEditorComponent'
import commonUtils from 'utils/CommonUtils'

class KNNSettings extends ModelSettingsEditorComponent {
  constructor (params) {
    super(params)

    this.k = {
      name: 'k',
      value: this.modelSettings.k,
    }
  }
}

export default commonUtils.build('knn-settings', KNNSettings, view)
