import ko from 'knockout'
import view from './heading.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import 'components/tags/badges-list/tags-badges-list'
import './heading.less'

class Heading extends Component {
  constructor (params) {
    super(params)
    this.title = params.name
    this.icon = params.icon || null
    this.theme = params.theme || null
    this.hasIcon = ko.computed(() => {
      return this.icon != null
    })
    this.description = params.description
    this.tags = params.tags
  }
}

export default commonUtils.build('heading-title', Heading, view)
