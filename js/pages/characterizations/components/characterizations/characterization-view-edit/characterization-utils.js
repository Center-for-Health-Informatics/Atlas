import ko from 'knockout'
import CharacterizationService from 'pages/characterizations/services/CharacterizationService'
import * as PermissionService from 'pages/characterizations/services/PermissionService'
import view from './characterization-utils.html?raw'
import config from 'appConfig'
import authApi from 'services/AuthAPI'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import 'utilities/import'
import 'utilities/export'
import './characterization-utils.less'

class CharacterizationViewEditUtils extends AutoBind(Component) {
  constructor (params) {
    super()

    this.loading = ko.observable(false)

    this.MODE_JSON = 0
    this.MODE_IMPORT = 1
    this.dirtyFlag = params.designDirtyFlag
    this.characterizationId = params.characterizationId
    this.mode = ko.observable(this.MODE_JSON)

    this.isPermittedExport = PermissionService.isPermittedExportCC
    this.isPermittedImport = PermissionService.isPermittedImportCC
    this.exportService = CharacterizationService.loadCharacterizationExportDesign
    this.importService = CharacterizationService.importCharacterization
    this.afterImportSuccess = params.afterImportSuccess

    this.setMode = this.setMode.bind(this)
  }

  setMode (mode) {
    this.mode(mode)
  }
}

export default commonUtils.build('characterization-view-edit-utils', CharacterizationViewEditUtils, view)
