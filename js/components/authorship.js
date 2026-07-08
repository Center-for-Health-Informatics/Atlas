import ko from 'knockout'
import view from './authorship.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import './authorship.less'

class Authorship extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.createdText = params.createdText || ko.i18n('components.authorship.created', 'created')
    this.createdBy = params.createdBy
    this.createdDate = params.createdDate
    this.modifiedBy = params.modifiedBy
    this.modifiedDate = params.modifiedDate
  }
}

export default commonUtils.build('authorship', Authorship, view)
