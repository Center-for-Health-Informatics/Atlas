import ko from 'knockout'
import sharedState from 'atlas-state'
import view from './permissions.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import ohdsiUtils from 'assets/ohdsi.util'
import userService from 'services/User'
import roleService from 'services/role'
import authApi from 'services/AuthAPI'
import constants from '../../const'
import 'databindings'

class PermissionsView extends AutoBind(Component) {
  constructor (params) {
    super(params)

    this.isNewRole = params.isNewRole
    this.roleId = params.roleId
    this.permissionItems = params.permissionItems
    this.tableOptions = commonUtils.getTableOptions('L')
    this.canEditRolePermissions = ko.pureComputed(() => { return authApi.isAuthenticated() && (this.isNewRole() || authApi.isPermittedEditRolePermissions(this.roleId())) })
  }

  renderCheckbox (field, editable) {
    return editable
      ? '<span data-bind="click: function(d) { d.' + field + '(!d.' + field + '()); } , css: { selected: ' + field + '}" class="fa fa-check"></span>'
      : '<span data-bind="css: { selected: ' + field + '}" class="fa fa-check readonly"></span>'
  }
}

export default commonUtils.build('permissions', PermissionsView, view)
