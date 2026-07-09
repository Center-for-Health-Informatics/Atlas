import view from './white-page.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import './white-page.less'

class WhitePage extends Component {
}

export default commonUtils.build('white-page', WhitePage, view)
