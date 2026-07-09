import ko from 'knockout'
import view from './tabbed-grid.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import constants from 'pages/characterizations/const'
import 'databindings'
import './tabbed-grid.less'
import 'components/heading'
import 'faceted-datatable'

class CharacterizationsTabbedGrid extends Component {
  constructor (params) {
    super()

    this.tabs = constants.gridTabs
    this.activeTab = params.activeTab

    this.isViewPermitted = params.isViewPermitted
    this.data = params.data
    this.gridColumns = params.gridColumns
    this.gridOptions = params.gridOptions
    this.order = params.order || [[3, 'desc']]

    this.createNew = params.createNew
    this.createNewEnabled = typeof params.createNewEnabled === 'undefined' ? () => true : params.createNewEnabled
    this.createNewLabel = constants.gridTabs.filter(t => t.value === params.activeTab).newEntityLabel
    this.tableOptions = commonUtils.getTableOptions('L')
  }

  get datatableLanguage () {
    return ko.i18n('datatable.language')
  }
}

export default commonUtils.build('characterizations-tabbed-grid', CharacterizationsTabbedGrid, view)
