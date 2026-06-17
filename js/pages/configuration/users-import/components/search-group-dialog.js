import ko from 'knockout'
import view from './search-group-dialog.html?raw'
import AutoBind from 'utils/AutoBind'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import 'components/modal'
import './ldap-groups'

class SearchGroupDialog extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.open = params.open || ko.observable()
    this.importProvider = params.importProvider
    this.selectedRole = params.selectedRole
    this.searchResults = params.searchResults
    this.setGroupMapping = params.setGroupMapping
    this.closeModal = params.closeModal
  }
}

commonUtils.build('search-group-dialog', SearchGroupDialog, view)
