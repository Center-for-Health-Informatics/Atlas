import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import view from './nav-pills.html?raw'
import './nav-pills.less'

class NavPills extends AutoBind(Component) {
  constructor (params) {
    super()
    this.selected = params.selected
    this.pills = params.pills
  }

  onSelect (pill, event) {
    this.selected(pill.key)
  }
}

export default commonUtils.build('nav-pills', NavPills, view)
