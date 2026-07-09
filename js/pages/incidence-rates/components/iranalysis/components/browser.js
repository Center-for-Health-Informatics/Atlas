import view from './browser.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import 'faceted-datatable'

class IRAnalysisBrowserModel extends Component {
  constructor (params) {
    super(params)
    this.analysisList = params.analysisList
    this.tableOptions = params.tableOptions || commonUtils.getTableOptions('M')
    this.options = params.options
    this.columns = params.columns

    this.rowClick = this.rowClick.bind(this)
  }

  rowClick (d) {
    this.selected(d.id)
  }
}

export default commonUtils.build('ir-analysis-browser', IRAnalysisBrowserModel, view)
