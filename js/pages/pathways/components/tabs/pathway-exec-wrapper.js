import ko from 'knockout'
import view from './pathway-exec-wrapper.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import JobPollService from 'services/JobPollService'
import consts from 'const'
import PathwayService from '../../PathwayService'
import * as PermissionService from '../../PermissionService'
import './pathway-results'
import 'components/analysisExecution/analysis-execution-list'

class PathwayExecWrapper extends Component {
  constructor (params) {
    super()

    this.executionId = params.executionId
    this.criticalCount = params.criticalCount
    this.dirtyFlag = params.dirtyFlag

    const extraExecutionPermissions = ko.computed(() => !this.dirtyFlag().isDirty() &&
              params.isEditPermitted() &&
              this.criticalCount() <= 0)

    const generationDisableReason = ko.computed(() => {
      if (this.dirtyFlag().isDirty()) return ko.unwrap(consts.disabledReasons.DIRTY)
      if (this.criticalCount() > 0) return ko.unwrap(consts.disabledReasons.INVALID_DESIGN)
      return ko.unwrap(consts.disabledReasons.ACCESS_DENIED)
    })
    this.componentParams = {
      tableColumns: ['Date', 'Design', 'Status', 'Duration', 'Results'],
      runExecutionInParallel: false,
      resultsPathPrefix: '/pathways/',
      ExecutionService: PathwayService,
      PermissionService,
      PollService: JobPollService,
      extraExecutionPermissions,
      generationDisableReason,
      executionResultMode: consts.executionResultModes.VIEW,
      selectedSourceId: params.selectedSourceId,
      ...params,
    }
  }
}

export default commonUtils.build('pathway-exec-wrapper', PathwayExecWrapper, view)

