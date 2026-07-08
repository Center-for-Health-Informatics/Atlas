import ko from 'knockout'
import config from 'appConfig'
import view from './browser.html?raw'
import authApi from 'services/AuthAPI'
import * as permissionService from './services/PermissionService'
import AutoBind from 'utils/AutoBind'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import datatableUtils from 'utils/DatatableUtils'
import jobService from './services/JobService'
import Const from './const'
import Utils from './utils'
import './browser.less'

class UserImportBrowser extends AutoBind(Component) {
  constructor (params) {
    super()
    this.config = config
    this.isAuthenticated = authApi.isAuthenticated
    this.canImport = ko.pureComputed(() => authApi.isPermittedImportUsers())
    this.canCreate = ko.pureComputed(() => permissionService.isPermittedCreate())
    this.loading = ko.observable()
    this.data = ko.observableArray()
    this.tableOptions = commonUtils.getTableOptions('L')
    this.gridColumns = [
      {
        title: ko.i18n('columns.provider', 'Provider'),
        data: 'providerType',
        className: this.classes('tbl-col', 'provider'),
        render: datatableUtils.getLinkFormatter(d => ({
          link: '#/import/job/' + d.id,
          label: Const.AuthenticationProviders.find(p => p.value === d.providerType).label,
        })),
      },
      {
        title: ko.i18n('columns.enabled', 'Enabled'),
        data: 'enabled',
        className: this.classes('tbl-col', 'enabled'),
        render: data => data ? 'Yes' : 'No',
      },
      {
        title: ko.i18n('columns.startDate', 'Start date'),
        className: this.classes('tbl-col', 'start-date'),
        render: datatableUtils.getDateFieldFormatter('startDate'),
      },
      {
        title: ko.i18n('columns.execute', 'Execute'),
        data: 'frequency',
        className: this.classes('tbl-col', 'frequency'),
        render: Utils.ExecuteRender,
      },
      {
        title: ko.i18n('columns.ends', 'Ends'),
        className: this.classes('tbl-col', 'ends'),
        render: Utils.EndsRender,
      },
      {
        title: ko.i18n('columns.lastExecuted', 'Last executed'),
        className: this.classes('tbl-col', 'last-executed'),
        render: datatableUtils.getDateFieldFormatter('lastExecuted', '-'),
      },
      {
        title: ko.i18n('columns.nextExecution', 'Next execution'),
        className: this.classes('tbl0col', 'next-execution'),
        render: datatableUtils.getDateFieldFormatter('nextExecution', '-'),
      },
    ]
    this.gridOptions = {
      Facets: [
        {
          caption: ko.i18n('facets.caption.provider', 'Provider'),
          binding: (o) => o.providerType,
        },
        {
          caption: ko.i18n('facets.caption.startDate', 'Start date'),
          binding: (o) => datatableUtils.getFacetForDate(o.startDate)
        },
      ]
    }

    permissionService.isPermittedList() && this.loadJobs()
  }

  loadJobs () {
    this.loading(true)
    jobService.listJobs()
      .then(res => this.data(res))
      .finally(() => this.loading(false))
  }

  importNow () {
    commonUtils.routeTo('/import/wizard')
  }

  newScheduledImport () {
    commonUtils.routeTo('/import/job/0')
  }
}

export default commonUtils.build('user-import-browser', UserImportBrowser, view)
