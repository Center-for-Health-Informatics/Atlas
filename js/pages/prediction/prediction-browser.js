import ko from 'knockout'
import view from './prediction-browser.html?raw'
import config from 'appConfig'
import constants from './const'
import momentApi from 'services/MomentAPI'
import * as PermissionService from './PermissionService'
import Page from 'pages/Page'
import commonUtils from 'utils/CommonUtils'
import datatableUtils from 'utils/DatatableUtils'
import PredictionService from 'services/Prediction'
import authAPI from 'services/AuthAPI'
import 'faceted-datatable'
import 'components/ac-access-denied'
import 'components/heading'
import 'components/empty-state'
import './prediction-browser.less'

class PredictionBrowser extends Page {
  constructor (params) {
    super(params)
    this.reference = ko.observableArray()
    this.loading = ko.observable(false)
    this.config = config

    this.canReadPredictions = PermissionService.isPermittedList
    this.canCreatePrediction = PermissionService.isPermittedCreate

    this.isAuthenticated = authAPI.isAuthenticated
    this.hasAccess = authAPI.isPermittedReadPlps
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
          caption: ko.i18n('facets.caption.designs', 'Designs'),
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
          link: constants.paths.analysis(d.id),
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
    if (this.canReadPredictions()) {
      this.loading(true)
      PredictionService.getPredictionList()
        .then(({ data }) => {
          datatableUtils.coalesceField(data, 'modifiedDate', 'createdDate')
          this.loading(false)
          this.reference(data)
        })
    }
  }

  newPrediction () {
    document.location = constants.paths.createAnalysis()
  }
}

export default commonUtils.build('prediction-browser', PredictionBrowser, view)
