import ko from 'knockout'
import view from './vocabulary.html?raw'
import Page from 'pages/Page'
import './components/search'
import commonUtils from 'utils/CommonUtils'
import 'components/heading'
import './vocabulary.less'

class Vocabulary extends Page {
  constructor (params) {
    super(params)
    this.model = params.model
    this.query = ko.observable()
  }

  onRouterParamsChanged ({ query }) {
    if (query !== undefined) {
      this.query(query)
    }
  }
}

export default commonUtils.build('vocabulary', Vocabulary, view)
