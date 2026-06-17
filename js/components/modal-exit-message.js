import ko from 'knockout'
import view from './modal-exit-message.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import Clipboard from 'utils/Clipboard'
import commonUtils from 'utils/CommonUtils'
import './modal-exit-message.less'

class ModalExitMessage extends AutoBind(Clipboard(Component)) {
  constructor (params) {
    super(params)

    const {
      showModal,
      title,
      exitMessage,
      buttonId = 'copyExitMessage',
      noticeId = 'copyExitMessageNotice',
    } = params

    this.showModal = showModal
    this.title = title
    this.exitMessage = exitMessage
    this.buttonId = buttonId
    this.noticeId = noticeId
  }

  copyExitMessageToClipboard () {
    this.copyToClipboard(`#${this.buttonId}`, `#${this.noticeId}`)
  }
}

export default commonUtils.build('modal-exit-message', ModalExitMessage, view)

