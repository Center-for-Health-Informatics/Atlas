import ko from 'knockout'
import view from './covariate-settings-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import CovariateSettings from '../InputTypes/CovariateSettings'
import './featureextraction.less'

class CovariateSettingsEditor extends Component {
  constructor (params) {
    super(params)

    this.covariateSettings = (params.covariateSettings == null ? new CovariateSettings() : (ko.isObservable(params.covariateSettings) ? params.covariateSettings() : params.covariateSettings))
    this.longTermLabel = ko.pureComputed(() => {
      return this.getWindowLabel(this.covariateSettings.longTermStartDays())
    })
    this.isEditPermitted = params.isEditPermitted

    this.mediumTermLabel = ko.pureComputed(() => {
      return this.getWindowLabel(this.covariateSettings.mediumTermStartDays())
    })

    this.shortTermLabel = ko.pureComputed(() => {
      return this.getWindowLabel(this.covariateSettings.shortTermStartDays())
    })
  }

  getWindowLabel (value) {
    const dayLabel = Math.abs(value) === 1 ? 'day' : 'days'
    return '(' + value + ' ' + dayLabel + ')'
  }
}

export default commonUtils.build('covar-settings-editor', CovariateSettingsEditor, view)
