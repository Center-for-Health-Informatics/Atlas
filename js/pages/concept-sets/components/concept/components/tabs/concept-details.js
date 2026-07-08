import ko from 'knockout'
import view from './concept-details.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import momentApi from 'services/MomentAPI'
import './concept-details.less'

class ConceptDetails extends Component {
  constructor (params) {
    super(params)
    this.currentConcept = params.currentConcept
    this.hasInfoAccess = params.hasInfoAccess
    this.isAuthenticated = params.isAuthenticated
  }

  formatDate (date) {
    return momentApi.formatDateTimeWithFormat(date, momentApi.ISO_DATE_FORMAT)
  }
}

export default commonUtils.build('concept-details', ConceptDetails, view)
