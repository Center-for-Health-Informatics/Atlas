import ko from 'knockout'
import CharacterizationService from 'pages/characterizations/services/CharacterizationService'
import PermissionService from 'pages/characterizations/services/PermissionService'
import view from './characterizations-list.html?raw'
import config from 'appConfig'
import authApi from 'services/AuthAPI'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import datatableUtils from 'utils/DatatableUtils'
import constants from 'pages/characterizations/const'
import '../tabbed-grid'
import './characterizations-list.less'
import 'components/ac-access-denied'

class Characterizations extends Component {
  constructor (params) {
    super()

    this.gridTab = constants.characterizationsTab

    this.loading = ko.observable(false)
    this.data = ko.observableArray()

    this.isGetCCListPermitted = PermissionService.isPermittedGetCCList
    this.isCreatePermitted = PermissionService.isPermittedCreateCC

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
          link: '#/cc/characterizations/' + d.id,
          label: d['name']
        })),
      },
      {
        title: ko.i18n('columns.created', 'Created'),
        className: this.classes('tbl-col', 'created'),
        render: datatableUtils.getDateFieldFormatter(),
      },
      {
        title: ko.i18n('columns.updated', 'Updated'),
        className: this.classes('tbl-col', 'updated'),
        render: datatableUtils.getDateFieldFormatter('modifiedDate'),
      },
      {
        title: ko.i18n('columns.author', 'Author'),
        className: this.classes('tbl-col', 'author'),
        render: datatableUtils.getCreatedByFormatter(),
      },

    ])
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

    this.isGetCCListPermitted() && this.loadData()
  }

  loadData () {
    this.loading(true)
    CharacterizationService
      .loadCharacterizationList()
      .then(res => {
        datatableUtils.coalesceField(res.content, 'modifiedDate', 'createdDate')
        datatableUtils.addTagGroupsToFacets(res.content, this.gridOptions.Facets)
        datatableUtils.addTagGroupsToColumns(res.content, this.gridColumns)
        this.data(res.content)
        this.loading(false)
      })
  }

  createCharacterization () {
    commonUtils.routeTo('/cc/characterizations/0')
  }
}

export default commonUtils.build('characterizations-list', Characterizations, view)

