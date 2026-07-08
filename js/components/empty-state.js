import ko from 'knockout'
import view from './empty-state.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import './empty-state.less'

class EmptyState extends Component {
  constructor (params) {
    super(params)
    this.message = params.message || ko.i18n('common.noData', 'No data')

    return this
  }
}

export default commonUtils.build('empty-state', EmptyState, view)
