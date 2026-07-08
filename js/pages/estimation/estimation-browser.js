import ko from 'knockout'
import view from './estimation-browser.html?raw'
import config from 'appConfig'
import constants from './const'
import momentApi from 'services/MomentAPI'
import * as PermissionService from './PermissionService'
import Page from 'pages/Page'
import commonUtils from 'utils/CommonUtils'
import datatableUtils from 'utils/DatatableUtils'
import EstimationService from 'services/Estimation'
import authAPI from 'services/AuthAPI'
import 'faceted-datatable'
import 'components/ac-access-denied'
import 'components/heading'
import 'components/empty-state'
import './estimation-browser.less'

class EstimationBrowser extends Page {
  constructor (params) {
    super(params)
    this.reference = ko.observableArray()
    this.loading = ko.observable(false)
    this.config = config

    this.canReadEstimations = PermissionService.isPermittedList
    this.canCreateEstimation = PermissionService.isPermittedCreate

    this.isAuthenticated = authAPI.isAuthenticated
    this.hasAccess = authAPI.isPermittedReadEstimations
    this.tableOptions = commonUtils.getTableOptions('L')
    this.options = {
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
          caption: 'Designs',
          binding: datatableUtils.getFacetForDesign,
        },
      ]
    }

    this.columns = [
      {
        title: ko.i18n('columns.id', 'Id'),
        data: 'id'
      },
      {
        title: ko.i18n('columns.type', 'Type'),
        data: d => d.type,
        visible: false,
      },
      {
        title: ko.i18n('columns.name', 'Name'),
        render: datatableUtils.getLinkFormatter(d => ({
          link: constants.paths.ccaAnalysisDash(d.id),
          label: d['name']
        })),
      },
      {
        title: ko.i18n('columns.created', 'Created'),
        render: datatableUtils.getDateFieldFormatter('createdDate'),
      },
      {
        title: ko.i18n('columns.updated', 'Updated'),
        render: datatableUtils.getDateFieldFormatter('modifiedDate'),
      },
      {
        title: ko.i18n('columns.author', 'Author'),
        render: datatableUtils.getCreatedByFormatter(),
      }
    ]
  }

  onPageCreated () {
    if (this.canReadEstimations()) {
      this.loading(true)
      EstimationService.getEstimationList()
        .then(({ data }) => {
          datatableUtils.coalesceField(data, 'modifiedDate', 'createdDate')
          this.loading(false)
          this.reference(data)
        })
    }
  }

  newEstimation () {
    document.location = constants.paths.createCcaAnalysis()
  }
}

export default commonUtils.build('estimation-browser', EstimationBrowser, view)
