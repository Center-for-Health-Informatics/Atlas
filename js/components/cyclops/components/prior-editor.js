import ko from 'knockout'
import view from './prior-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import options from '../options'
import 'databindings'

class PriorEditor extends Component {
  constructor (params) {
    super(params)

    this.prior = ko.isObservable(params.prior) ? params.prior() : params.prior
    this.options = options
    this.isEditPermitted = params.isEditPermitted
  }
}

export default commonUtils.build('cyclops-prior-editor', PriorEditor, view)

