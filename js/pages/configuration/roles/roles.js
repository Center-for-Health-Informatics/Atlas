import ko from 'knockout'
import view from './roles.html?raw'
import Page from 'pages/Page'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import authApi from 'services/AuthAPI'
import roleService from 'services/role'
import sharedState from 'atlas-state'
import 'databindings'
import 'components/ac-access-denied'
import 'components/heading'

class Roles extends AutoBind(Page) {
  constructor (params) {
    super(params)
    this.roles = ko.observable([])
    this.loading = ko.observable()
    this.tableOptions = commonUtils.getTableOptions('L')
    this.isAuthenticated = authApi.isAuthenticated
    this.canRead = ko.pureComputed(() => { return this.isAuthenticated() && authApi.isPermittedReadRoles() })
    this.canCreate = ko.pureComputed(() => { return this.isAuthenticated() && authApi.isPermittedCreateRole() })
  }

  onPageCreated () {
    if (this.canRead()) {
      this.loading(true)
      roleService.updateRoles().then(() => {
        this.loading(false)
        this.roles(sharedState.roles())
      })
    }
  }

  selectRole (data) {
    commonUtils.routeTo('/role/' + data.id)
  }

  newRole () {
    commonUtils.routeTo('/role/0')
  }

  importRoles () {
    commonUtils.routeTo('/import/roles')
  }
}

export default commonUtils.build('roles', Roles, view)

