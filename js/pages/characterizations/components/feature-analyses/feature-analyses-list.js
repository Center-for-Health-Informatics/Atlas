import ko from 'knockout'
import FeatureAnalysisService from 'pages/characterizations/services/FeatureAnalysisService'
import PermissionService from 'pages/characterizations/services/PermissionService'
import view from './feature-analyses-list.html?raw'
import config from 'appConfig'
import authApi from 'services/AuthAPI'
import Page from 'pages/Page'
import commonUtils from 'utils/CommonUtils'
import datatableUtils from 'utils/DatatableUtils'
import constants from 'pages/characterizations/const'
import feConst from './const'
import '../tabbed-grid'
import './feature-analyses-list.less'

class FeatureAnalyses extends Page {
  constructor (params) {
    super(params)

    this.gridTab = constants.featureAnalysesTab

    this.loading = ko.observable(false)
    this.data = ko.observableArray()

    this.gridColumns = feConst.FeatureAnalysisColumns(this.classes)
    this.gridOptions = {
      Facets: feConst.FeatureAnalysisFacets,
    }
  }

  onRouterParamsChanged () {
    this.isGetListPermitted() && this.loadData()
  }

  isGetListPermitted () {
    return PermissionService.isPermittedGetFaList()
  }

  isCreatePermitted () {
    return PermissionService.isPermittedCreateFa()
  }

  async loadData () {
    this.loading(true)
    const res = await FeatureAnalysisService.loadFeatureAnalysisList()
    datatableUtils.coalesceField(res.content, 'modifiedDate', 'createdDate')
    this.data(res.content)
    this.loading(false)
  }

  createFeature () {
    commonUtils.routeTo('/cc/feature-analyses/0')
  }
}

export default commonUtils.build('feature-analyses-list', FeatureAnalyses, view)

