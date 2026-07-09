import ko from 'knockout'
import view from './conceptset.html?raw'
import Component from 'components/Component'
import ImportComponent from './ImportComponent'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import constants from '../const'
import conceptSetUtils from '../utils'

class ConceptSetImport extends AutoBind(ImportComponent(Component)) {
  constructor (params) {
    super(params)
    this.canEdit = params.canEdit
    this.buttonTooltipText = conceptSetUtils.getPermissionsText(this.canEdit(), 'edit')
    this.importTypes = constants.importTypes
    this.importConceptSetExpression = params.importConceptSetExpression
    this.importConceptSetJson = ko.observable()
    this.doImport = this.doImport.bind(this)
    this.errorMessage = ko.observable('')
    this.setTimeoutId = null
  }

  async runImport (options) {
    try {
      let expression = null
      try {
        expression = JSON.parse(this.importConceptSetJson())
      } catch (err) {
        throw (new Error('Error parsing JSON.  Please ensure it is well-formed.'))
      }
      await this.importConceptSetExpression(expression, options)
      this.importConceptSetJson('')
    } catch (err) {
      this.setError(err.message)
      throw (err)
    }
  }

  setError (errorMessage) {
    clearTimeout(this.setTimeoutId)
    this.errorMessage(errorMessage)
    this.setTimeoutId = setTimeout(() => this.errorMessage(''), 3000)
  }
}

export default commonUtils.build('conceptset-list-import-conceptset', ConceptSetImport, view)
