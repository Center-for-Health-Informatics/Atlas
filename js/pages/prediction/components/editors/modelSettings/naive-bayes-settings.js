import view from './naive-bayes-settings.html?raw'
import ModelSettingsEditorComponent from './ModelSettingsEditorComponent'
import commonUtils from 'utils/CommonUtils'

class NaiveBayesSettings extends ModelSettingsEditorComponent {
}

export default commonUtils.build('naive-bayes-settings', NaiveBayesSettings, view)
