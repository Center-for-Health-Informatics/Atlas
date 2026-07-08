import ko from 'knockout'
import view from './white-page.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import authApi from 'unauthenticated'
import './white-page.less'

class WhitePage extends Component {
  constructor (params) {
    super(params)
  }
}

export default commonUtils.build('white-page', WhitePage, view)
