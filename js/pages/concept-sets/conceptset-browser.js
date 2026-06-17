import ko from 'knockout'
import view from './conceptset-browser.html?raw'
import Page from 'pages/Page'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import authAPI from 'services/AuthAPI'
import 'components/heading'
import 'components/tabs'
import './components/conceptsets-list'
import './components/conceptsets-export'
import './conceptset-browser.less'

class ConceptsetBrowser extends AutoBind(Page) {
  constructor (params) {
    super(params)
    this.componentParams = params

    this.isAuthenticated = authAPI.isAuthenticated
    this.hasAccess = authAPI.isPermittedReadConceptsets
  }
}

export default commonUtils.build('conceptset-browser', ConceptsetBrowser, view)

