import ko from 'knockout'
import view from './included-preview-badge.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import 'components/conceptsetInclusionCount/conceptsetInclusionCount'

class IncludedPreviewBadge extends Component {
  constructor (params) {
    super(params)
    this.expression = ko.pureComputed(() => {
      return {
        items: params.previewConcepts()
      }
    })
  }
}

export default commonUtils.build('conceptset-list-included-preview-badge', IncludedPreviewBadge, view)

