import ko from 'knockout'
import * as Poll from 'services/Poll'
import sharedState from 'atlas-state'

class JobPollService extends Poll.PollServiceClass {
  constructor () {
    super()
    this.isJobListMutated = ko.observable()
    this.isJobListMutated.extend({ notify: 'always' })
  }

  extraActionsAfterCallback () {
    sharedState.jobListing.valueHasMutated()
  }
}
export default new JobPollService()
