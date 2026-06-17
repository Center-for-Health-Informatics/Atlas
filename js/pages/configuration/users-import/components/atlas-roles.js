import ko from 'knockout'
import view from './atlas-roles.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import renderers from 'utils/Renderers'

class AtlasRoles extends Component {
  constructor (params) {
    super(params)
    this.roles = params.roles || []
    this.tableOptions = commonUtils.getTableOptions('L')
    this.renderCheckbox = this.renderCheckbox.bind(this)
  }

  renderCheckbox (field) {
    return renderers.renderCheckbox(field)
  }
}

commonUtils.build('atlas-roles', AtlasRoles, view)
