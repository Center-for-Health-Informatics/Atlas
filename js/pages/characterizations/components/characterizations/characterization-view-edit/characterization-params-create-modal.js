import ko from 'knockout'
import sharedState from 'atlas-state'
import view from './characterization-params-create-modal.html?raw'
import config from 'appConfig'
import authApi from 'services/AuthAPI'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import 'utils/DatatableUtils'
import 'pages/characterizations/const'
import './characterization-params-create-modal.less'

class CharacterizationParamsCreateModal extends Component {
  constructor (params) {
    super()

    this.showModal = params.showModal
    this.parentSubmit = params.submit

    this.paramName = ko.observable()
    this.paramValue = ko.observable()

    this.submitParam = this.submitParam.bind(this)
  }

  submitParam () {
    this.parentSubmit({
      name: this.paramName(),
      value: this.paramValue()
    })
    this.resetParams()
  }

  resetParams () {
    this.paramName('')
    this.paramValue('')
  }
}

export default commonUtils.build('characterization-params-create-modal', CharacterizationParamsCreateModal, view)

