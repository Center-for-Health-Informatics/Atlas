import ko from 'knockout'
import view from './naive-bayes-settings.html?raw'
import ModelSettingsEditorComponent from './ModelSettingsEditorComponent'
import commonUtils from 'utils/CommonUtils'

class NaiveBayesSettings extends ModelSettingsEditorComponent {
  constructor (params) {
    super(params)
  }
}

export default commonUtils.build('naive-bayes-settings', NaiveBayesSettings, view)
