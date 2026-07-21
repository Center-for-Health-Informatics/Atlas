import ko from 'knockout'
import { Modal } from 'bootstrap'
import commonUtils from 'utils/CommonUtils'
import template from './concept-modal.html?raw'
import 'databindings'

function ConceptSetListModal (params) {
  const self = this
  self.title = params.title || 'Concept List'
  self.conceptSetList = params.conceptSetList
  self.isShown = params.isShown
  self.commonUtils = commonUtils
  self.onNavigate = function () {
    // closes the modal when the concept link is clicked (causing a route change)
    // see: https://github.com/twbs/bootstrap/issues/489
    document.querySelectorAll('.modal.show').forEach(el => Modal.getInstance(el)?.hide())
  }
  self.tableOptions = commonUtils.getTableOptions('M')
}
const component = {
  viewModel: ConceptSetListModal,
  template
}

ko.components.register('conceptset-concept-modal', component)

export default component
