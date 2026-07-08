import ko from 'knockout'
import view from './population-settings-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import predictionConstants from '../../const'
import constants from 'const'
import 'databindings'
import './population-settings-editor.less'

class PopulationSettingsEditor extends Component {
  constructor (params) {
    super(params)

    this.populationSettings = params.populationSettings
    this.options = predictionConstants.options
    this.constants = constants
    this.isEditPermitted = params.isEditPermitted
  }
}

export default commonUtils.build('population-settings-editor', PopulationSettingsEditor, view)
