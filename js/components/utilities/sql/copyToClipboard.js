import ko from 'knockout'
import view from './copyToClipboard.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import Clipboard from 'utils/Clipboard'
import './copyToClipboard.less'

class CopyToClipboard extends AutoBind(Clipboard(Component)) {
  constructor (params) {
    super(params)
    const { copyButtonId = 'btnCopyCohortSQLClipboard', copyMessageId = 'copyCopyCohortSQLMessage' } = params
    this.copyButtonId = ko.observable(copyButtonId)
    this.copyMessageId = ko.observable(copyMessageId)
    this.buttonText = ko.i18n('common.copyToClipboard', 'Copy To Clipboard')
    this.messageText = ko.i18n('common.copiedToClipboard', 'Copied To Clipboard!')
    this.selectedTab = params.selectedTab
    this.componentParams = ko.computed(() => this.selectedTab().componentParams)
    this.clipboardTarget = ko.computed(() => '#' + this.componentParams().clipboardTarget)
  }

  copyDataToClipboard () {
    this.copyToClipboard('#' + this.copyButtonId(), '#' + this.copyMessageId())
  }
}

export default commonUtils.build('copy-to-clipboard', CopyToClipboard, view)
