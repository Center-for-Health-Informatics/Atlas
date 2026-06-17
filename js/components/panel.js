import ko from 'knockout'
import view from './panel.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import './panel.less'

class Panel extends Component {
  constructor (params) {
    super(params)
    this.title = params.title
    this.templateId = params.templateId
    this.context = params.context
  }
}

export default commonUtils.build('panel', Panel, view)

