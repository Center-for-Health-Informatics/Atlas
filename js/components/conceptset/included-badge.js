import ko from 'knockout'
import view from './included-badge.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import 'components/conceptsetInclusionCount/conceptsetInclusionCount'

class IncludedBadge extends Component {
  constructor (params) {
    super(params)
    this.expression = ko.pureComputed(() => params.currentConceptSet() && params.currentConceptSet().expression)
  }
}

export default commonUtils.build('conceptset-list-included-badge', IncludedBadge, view)

