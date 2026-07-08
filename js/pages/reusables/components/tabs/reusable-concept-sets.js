import ko from 'knockout'
import view from './reusable-concept-sets.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import ConceptSetStore from 'components/conceptset/ConceptSetStore'
import 'components/conceptset/conceptset-list'

class ReusableConceptSets extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.design = params.design
    this.designId = params.designId
    this.isEditPermitted = params.isEditPermitted || (() => false)
    this.conceptSets = this.design().conceptSets
    this.conceptSetStore = ConceptSetStore.getStore(ConceptSetStore.sourceKeys().reusables)
  }
}

export default commonUtils.build('reusable-concept-sets', ReusableConceptSets, view)
