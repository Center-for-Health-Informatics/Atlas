import ko from 'knockout'
import view from './negative-control-outcome-cohort-settings-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import constants from '../../const'
import 'databindings'

class NegativeControlOutcomeCohortSettingsEditor extends Component {
  constructor (params) {
    super(params)
    this.isEditPermitted = params.isEditPermitted

    this.negativeControlCohortSettings = params.negativeControlCohortSettings
    this.options = constants.options
  }
}

export default commonUtils.build('nc-outcome-cohort-settings-editor', NegativeControlOutcomeCohortSettingsEditor, view)

