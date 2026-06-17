import ko from 'knockout'
import view from './identifiers.html?raw'
import Component from 'components/Component'
import ImportComponent from './ImportComponent'
import AutoBind from 'utils/AutoBind'
import Clipboard from 'utils/Clipboard'
import commonUtils from 'utils/CommonUtils'
import vocabularyApi from 'services/VocabularyProvider'
import sharedState from 'atlas-state'

class IndetifiersImport extends AutoBind(ImportComponent(Component)) {
  constructor (params) {
    super(params)
    this.appendConcepts = params.appendConcepts
    this.identifiers = ko.observable('')
    this.canAddConcepts = ko.pureComputed(() => this.identifiers().length > 0 && params.canEdit())
    this.doImport = this.doImport.bind(this)
  }

  async runImport (options) {
    const { data } = await vocabularyApi.getConceptsById(this.identifiers().match(/[0-9]+/g))
    this.appendConcepts(data, options)
    this.identifiers('')
  }
}

export default commonUtils.build('conceptset-list-import-identifiers', IndetifiersImport, view)

