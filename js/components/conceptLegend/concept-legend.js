import ko from 'knockout'
import Component from 'components/Component'
import CommonUtils from 'utils/CommonUtils'
import view from './concept-legend.html?raw'
import './concept-legend.less'

class ConceptLegend extends Component {
  constructor (params) {
    super(params)
  }
}

export default CommonUtils.build('concept-legend', ConceptLegend, view)

