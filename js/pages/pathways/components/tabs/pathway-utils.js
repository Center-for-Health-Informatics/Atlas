import ko from 'knockout'
import PathwayService from '../../PathwayService'
import * as PermissionService from '../../PermissionService'
import view from './pathway-utils.html?raw'
import config from 'appConfig'
import authApi from 'services/AuthAPI'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import './pathway-utils.less'

class PathwayUtils extends AutoBind(Component) {
  constructor (params) {
    super()

    this.loading = ko.observable(false)

    this.MODE_JSON = 0
    this.MODE_IMPORT = 1

    this.dirtyFlag = params.dirtyFlag
    this.analysisId = params.analysisId
    this.mode = ko.observable(this.MODE_JSON)

    this.isExportPermitted = PermissionService.isPermittedExport
    this.isImportPermitted = PermissionService.isPermittedImport

    this.exportEntity = ko.observable()
    this.exportService = PathwayService.loadExportDesign
    this.importService = PathwayService.importPathwayDesign
    this.afterImportSuccess = params.afterImportSuccess

    this.subscriptions = []
    // subscriptions
    this.subscriptions.push(this.analysisId.subscribe((newVal) => {
      this.loadExportJSON()
      console.log(`New value of analysisId: ${newVal}`)
    }))
  }

  setMode (mode) {
    this.mode(mode)
  }

  async loadExportJSON () {
    if (this.analysisId() !== 0) {
      this.loading(true)
      const res = await PathwayService.loadExportDesign(this.analysisId())
      this.exportEntity(res)
      this.loading(false)
    }
  }

  dispose () {
    this.subscriptions.forEach(s => s.dispose())
  }
}

export default commonUtils.build('pathway-utils', PathwayUtils, view)
