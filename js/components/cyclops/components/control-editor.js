import ko from 'knockout'
import view from './control-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import options from '../options'
import 'databindings'

class ControlEditor extends Component {
  constructor (params) {
    super(params)

    this.control = ko.isObservable(params.control) ? params.control() : params.control
    this.options = options
    this.isEditPermitted = params.isEditPermitted
  }
}

export default commonUtils.build('cyclops-control-editor', ControlEditor, view)

