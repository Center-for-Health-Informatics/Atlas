import ko from 'knockout'
import view from './export.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import Clipboard from 'utils/Clipboard'
import commonUtils from 'utils/CommonUtils'

class ConceptSetExport extends AutoBind(Clipboard(Component)) {
  constructor (params) {
    super(params)
    this.loading = params.loading || ko.observable(false)
    this.conceptSetStore = params.conceptSetStore
    this.resolvingConceptSetExpression = this.conceptSetStore.resolvingConceptSetExpression
    this.currentConceptSetExpressionJson = this.conceptSetStore.currentConceptSetExpressionJson
    this.currentConceptIdentifierList = this.conceptSetStore.currentConceptIdentifierList
    this.currentIncludedConceptIdentifierList = this.conceptSetStore.currentIncludedConceptIdentifierList
  }

  copyExpressionToClipboard () {
    this.copyToClipboard('#btnCopyExpressionClipboard', '#copyExpressionToClipboardMessage')
  }

  copyIdentifierListToClipboard () {
    this.copyToClipboard('#btnCopyIdentifierListClipboard', '#copyIdentifierListMessage')
  }

  copyIncludedConceptIdentifierListToClipboard () {
    this.copyToClipboard('#btnCopyIncludedConceptIdentifierListClipboard', '#copyIncludedConceptIdentifierListMessage')
  }

  async exportCsv () {
    this.loading(true)
    try {
      await this.conceptSetStore.exportConceptSet()
    } finally {
      this.loading(false)
    }
  }
}

export default commonUtils.build('conceptset-list-export', ConceptSetExport, view)
