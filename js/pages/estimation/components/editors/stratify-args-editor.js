import ko from 'knockout'
import view from './stratify-args-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import constants from '../../const'
import 'databindings'

class StratifyArgsEditor extends Component {
  constructor (params) {
    super(params)

    this.stratifyArgs = params.stratifyArgs
    this.options = constants.options
    this.isEditPermitted = params.isEditPermitted

    // TODO: At the moment, we do not expose the ability
    // to edit Match/Stratify by covariate arguments
    // and if we do, we need to format the covariate
    // ID list as numbers
    this.hasCovariateIds = ko.pureComputed(() => {
      return (this.stratifyArgs.covariateIds !== undefined)
    })
  }
}

export default commonUtils.build('stratify-args-editor', StratifyArgsEditor, view)
