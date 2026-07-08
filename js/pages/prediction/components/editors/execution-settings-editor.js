import ko from 'knockout'
import view from './execution-settings-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import constants from '../../const'
import 'databindings'

class ExecutionSettingsEditor extends Component {
  constructor (params) {
    super(params)

    this.getPlpDataArgs = params.getPlpDataArgs()
    this.runPlpArgs = params.runPlpArgs()
    this.options = constants.options
    this.subscriptions = params.subscriptions
    this.isEditPermitted = params.isEditPermitted

    this.maxSampleSizeToggle = ko.observable(this.getPlpDataArgs.maxSampleSize() != null || false)
    this.subscriptions.push(this.maxSampleSizeToggle.subscribe(optionVal => {
      if (optionVal == false) {
        this.getPlpDataArgs.maxSampleSize(null)
      } else {
        this.getPlpDataArgs.maxSampleSize(10000)
      }
    }))
  }
}

export default commonUtils.build('execution-settings-editor', ExecutionSettingsEditor, view)
