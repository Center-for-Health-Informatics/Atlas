import ko from 'knockout'
import view from './temporal-covariate-settings-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import config from 'appConfig'
import TemporalCovariateSettings from '../InputTypes/TemporalCovariateSettings'
import './featureextraction.less'

class TemporalCovariateSettingsEditor extends Component {
  constructor (params) {
    super(params)

    this.covariateSettings = (params.covariateSettings == null ? new TemporalCovariateSettings() : params.covariateSettings)
  }
}

export default commonUtils.build('temporal-covar-settings-editor', TemporalCovariateSettingsEditor, view)

