import ko from 'knockout'
import view from './characterization-conceptsets.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import characterizationService from '../../../services/CharacterizationService'
import 'components/conceptset/conceptset-list'

class CharacterizationConceptSet extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.conceptSets = params.conceptSets
    this.conceptSetStore = params.conceptSetStore
    this.canEdit = params.canEdit || (() => false)
    this.characterizationId = params.characterizationId
  }

  exportConceptSets () {
    characterizationService.exportConceptSets(ko.unwrap(this.characterizationId))
  }
}

export default commonUtils.build('characterization-conceptsets', CharacterizationConceptSet, view)

