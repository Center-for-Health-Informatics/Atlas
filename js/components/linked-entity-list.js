import ko from 'knockout'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import view from './linked-entity-list.html?raw'
import 'components/entityBrowsers/cohort-definition-browser'
import './linked-entity-list.less'

class LinkedEntityList extends Component {
  constructor (params) {
    super()

    this.params = params

    this.title = params.title
    this.descr = params.descr
    this.newItemLabel = params.newItemLabel || ko.i18n('components.linkedEntityList.defaultNewItemLabel', 'Import')
    this.newItemAction = params.newItemAction
    this.data = params.data
    this.columns = params.columns
    this.isEditPermitted = params.isEditPermitted
    this.tableOptions = params.tableOptions || commonUtils.getTableOptions('S')
    this.language = ko.i18n('datatable.language')
  }
}

export default commonUtils.build('linked-entity-list', LinkedEntityList, view)
