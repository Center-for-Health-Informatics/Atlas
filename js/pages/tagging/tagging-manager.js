import ko from 'knockout'
import view from './tagging-manager.html?raw'
import Page from 'pages/Page'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import authApi from 'services/AuthAPI'
import 'databindings'
import 'components/ac-access-denied'
import 'components/heading'
import 'components/tabs'
import './tabs/multi-assign'

class TaggingManager extends AutoBind(Page) {
  constructor (params) {
    super(params)
    this.isAuthenticated = authApi.isAuthenticated
    this.selectedTabKey = ko.observable('multi-assign')
  }

  selectTab (index, { key }) {
    // commonUtils.routeTo(`/tagging/${key}`);
  }
}

export default commonUtils.build('tagging-manager', TaggingManager, view)
