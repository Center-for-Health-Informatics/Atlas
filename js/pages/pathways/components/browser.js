import ko from 'knockout'
import view from './browser.html?raw'
import constants from '../const'
import config from 'appConfig'
import PathwayService from '../PathwayService'
import * as PermissionService from '../PermissionService'
import authApi from 'services/AuthAPI'
import Page from 'pages/Page'
import commonUtils from 'utils/CommonUtils'
import datatableUtils from 'utils/DatatableUtils'
import './browser.less'
import 'components/heading'

class PathwaysBrowser extends Page {
  constructor (params) {
    super(params)
    this.loading = ko.observable(false)
    this.config = config
    this.analysisList = ko.observableArray()
    this.tableOptions = commonUtils.getTableOptions('L')
    this.canList = PermissionService.isPermittedList
    this.canCreate = PermissionService.isPermittedCreate

    this.gridOptions = {
      Facets: [
        {
          caption: ko.i18n('facets.caption.created', 'Created'),
          binding: (o) => datatableUtils.getFacetForDate(o.createdDate)
        },
        {
          caption: ko.i18n('facets.caption.updated', 'Updated'),
          binding: (o) => datatableUtils.getFacetForDate(o.modifiedDate)
        },
        {
          caption: ko.i18n('facets.caption.author', 'Author'),
          binding: datatableUtils.getFacetForCreatedBy,
        },
        {
          caption: ko.i18n('facets.caption.designs', 'Designs'),
          binding: datatableUtils.getFacetForDesign,
        },
      ]
    }

    this.gridColumns = ko.observableArray([
      {
        title: ko.i18n('columns.id', 'Id'),
        data: 'id'
      },
      {
        title: ko.i18n('columns.name', 'Name'),
        data: 'name',
        className: this.classes('tbl-col', 'name'),
        render: datatableUtils.getLinkFormatter(d => ({
          link: '#/pathways/' + d.id,
          label: d['name']
        }))
      },
      {
        title: ko.i18n('columns.created', 'Created'),
        className: this.classes('tbl-col', 'created'),
        render: datatableUtils.getDateFieldFormatter('createdDate'),
      },
      {
        title: ko.i18n('columns.updated', 'Updated'),
        className: this.classes('tbl-col', 'updated'),
        render: datatableUtils.getDateFieldFormatter('modifiedDate'),
      },
      {
        title: ko.i18n('columns.author', 'Author'),
        render: datatableUtils.getCreatedByFormatter(),
        className: this.classes('tbl-col', 'author'),
      }
    ])
  }

  onRouterParamsChanged () {
    this.canList() && this.loadData()
  }

  async loadData () {
    this.loading(true)
    const analysisList = await PathwayService.list()
    datatableUtils.coalesceField(analysisList.content, 'modifiedDate', 'createdDate')
    datatableUtils.addTagGroupsToFacets(analysisList.content, this.gridOptions.Facets)
    datatableUtils.addTagGroupsToColumns(analysisList.content, this.gridColumns)
    this.analysisList(analysisList.content)
    this.loading(false)
  }

  newAnalysis () {
    commonUtils.routeTo(commonUtils.getPathwaysUrl(0, 'design'))
  }
}

export default commonUtils.build('pathways-browser', PathwaysBrowser, view)
