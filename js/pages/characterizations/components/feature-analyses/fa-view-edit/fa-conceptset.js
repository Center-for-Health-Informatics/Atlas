import ko from 'knockout'
import view from './fa-conceptset.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import faService from '../../../services/FeatureAnalysisService'
import sharedState from 'atlas-state'
import 'components/conceptset/conceptset-list'

class FeatureAnalysisConceptSet extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.data = params.data
    this.canEdit = params.canEdit || (() => false)
    this.featureId = params.featureId
    this.conceptSetStore = params.conceptSetStore
    this.conceptSets = ko.pureComputed(() => this.data() && this.data().conceptSets)
  }

  exportConceptSets () {
    faService.exportConceptSets(ko.unwrap(this.featureId))
  }
}

export default commonUtils.build('feature-analysis-conceptset', FeatureAnalysisConceptSet, view)

