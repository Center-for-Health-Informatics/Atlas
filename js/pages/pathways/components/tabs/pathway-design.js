import view from './pathway-design.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import constants from '../../const'
import 'components/cohort/linked-cohort-list'
import './pathway-design.less'
import 'databindings'

class PathwayEditor extends Component {
  constructor (params) {
    super()
    this.params = params
    this.design = params.design
    this.isEditPermitted = params.isEditPermitted
    this.canEditName = params.isEditPermitted()
  }

  get combinationWindowOptions () {
    return constants.combinationWindowOptions
  }

  get minCellCountOptions () {
    return constants.minCellCountOptions
  }

  get maxDepthOptions () {
    return constants.maxDepthOptions
  }
}

export default commonUtils.build('pathway-design', PathwayEditor, view)
