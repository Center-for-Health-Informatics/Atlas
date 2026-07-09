import ko from 'knockout'
import view from './users.html?raw'
import AutoBind from 'utils/AutoBind'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import authApi from 'services/AuthAPI'
import 'databindings'

class UserView extends AutoBind(Component) {
  constructor (params) {
    super(params)

    this.isNewRole = params.isNewRole
    this.roleId = params.roleId
    this.userItems = params.userItems
    this.tableOptions = commonUtils.getTableOptions('L')
    this.areUsersSelected = ko.pureComputed(() => { return !!this.userItems().find(user => user.isRoleUser()) })
    this.canEditRoleUsers = ko.pureComputed(() => { return authApi.isAuthenticated() && (this.isNewRole() || authApi.isPermittedEditRoleUsers(this.roleId())) })
  }

  selectAllUsers () {
    this.userItems().forEach(user => user.isRoleUser(true))
  }

  deselectAllUsers () {
    this.userItems().forEach(user => user.isRoleUser(false))
  }

  renderCheckbox (field, editable) {
    return editable
      ? '<span data-bind="click: function(d) { d.' + field + '(!d.' + field + '()); } , css: { selected: ' + field + '}" class="fa fa-check"></span>'
      : '<span data-bind="css: { selected: ' + field + '}" class="fa fa-check readonly"></span>'
  }
}

export default commonUtils.build('users', UserView, view)
