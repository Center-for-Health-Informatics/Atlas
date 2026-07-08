import ko from 'knockout'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import view from './modal.html?raw'
import './modal.less'

class AtlasModal extends Component {
  constructor (params) {
    super()

    const {
      showModal,
      modifiers = [],
      dialogExtraClasses = [],
      iconClass,
      title,
      template,
      data,
      backdropClosable = true,
      fade = ko.observable(true),
      templateWrapperClass = { element: 'modal-body', extra: 'modal-body' }
    } = params

    this.showModal = showModal
    this.dialogExtraClasses = dialogExtraClasses
    this.iconClass = iconClass
    this.title = title
    this.template = template
    this.data = data
    this.fade = fade
    this.backdropClosable = backdropClosable
    this.templateWrapperClass = templateWrapperClass
    this.modifiers = [...modifiers, backdropClosable ? null : 'unclosable']
  }
}

export default commonUtils.build('atlas-modal', AtlasModal, view)
