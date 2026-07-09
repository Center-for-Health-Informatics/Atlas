import view from './ac-access-denied.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import 'forbidden'
import 'unauthenticated'
import './ac-access-denied.less'

class AccessDenied extends Component {
  constructor (params) {
    super(params)
    this.isAuthenticated = params.isAuthenticated
    this.isPermitted = params.isPermitted || (() => false)
  }
}

export default commonUtils.build('access-denied', AccessDenied, view)
