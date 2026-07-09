import view from './user-bar-jobs.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import './user-bar-jobs.less'

class UserBarJobs extends Component {
  constructor (params) {
    super()

    this.jobNameClick = params.jobNameClick
    this.jobListing = params.jobListing
  }
}

export default commonUtils.build('user-bar-jobs', UserBarJobs, view)
