import view from './step-header.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'

class StepHeader extends Component {
  constructor (params) {
    super(params)
    this.header = params.header || ''
  }
}

commonUtils.build('step-header', StepHeader, view)
