import ko from 'knockout'
import view from './conceptsets-export.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import config from 'appConfig'
import fileService from 'services/file'
import sharedState from 'atlas-state'
import 'components/tabs'
import 'circe'
import './conceptsets-export.less'

class ConceptsetExport extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.exportRowCount = ko.observable(0)
    this.exportConceptSets = []
    this.isInProgress = ko.observable(false)
    this.criteriaContext = sharedState.criteriaContext
    this.tableOptions = commonUtils.getTableOptions('L')
  }

  onExportAction (result) {
    if (result.action == 'add') {
      // Get the items we'd like to export from the table
      const itemsForExport = $('#exportConceptSetTable').DataTable().rows('.selected').data()
      const conceptSetIds = $.map(itemsForExport, function (obj) {
        return obj.id
      }).join('%2B') // + encoded
      if (conceptSetIds.length > 0) {
        this.isInProgress(true)
        fileService
          .loadZip(config.api.url + 'conceptset/exportlist?conceptsets=' + conceptSetIds, 'exportedConceptSets.zip')
          .finally(() => this.isInProgress(false))
      } else {
        alert('No concept set is selected.')
      }
    }
  }

  exportOnConceptSetSelected (conceptSet, valueAccessor, e) {
    $(e).toggleClass('selected')
    const exportTable = $('#exportConceptSetTable').DataTable()
    this.exportRowCount(exportTable.rows('.selected').data().length)
  }
}

export default commonUtils.build('conceptsets-export', ConceptsetExport, view)

