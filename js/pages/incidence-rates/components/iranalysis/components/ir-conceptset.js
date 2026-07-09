import ko from 'knockout'
import view from './ir-conceptset.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import irService from 'services/IRAnalysis'
import 'components/conceptset/conceptset-list'

class IncidenceRatesConceptSet extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.data = params.data
    this.canEdit = params.canEdit || (() => false)
    this.irAnalysisId = params.irAnalysisId
    this.conceptSets = ko.computed(() => this.data() && this.data().conceptSets)
    this.conceptSetStore = params.conceptSetStore
  }

  exportConceptSets () {
    irService.exportConceptSets(ko.unwrap(this.irAnalysisId))
  }
}

export default commonUtils.build('incidence-rates-conceptset', IncidenceRatesConceptSet, view)
