import ko from 'knockout'
import { orderBy } from 'utils/NativeCompat'
import consts from '../const'

async function StartExecution (executionGroup) {
  let confirmPromise
  if (!executionGroup) {
    confirmPromise = new Promise((resolve, reject) => reject(new Error('No execution group provided')))
  } else {
    if ([consts.generationStatuses.STARTED, consts.generationStatuses.RUNNING].includes(executionGroup.status())) {
      confirmPromise = new Promise((resolve, reject) => {
        if (confirm(ko.i18n('components.executionUtils.startNewExecutionInParallelConfirmation', 'A generation for the source has already been started. Are you sure you want to start a new one in parallel?')())) {
          resolve()
        } else {
          reject(new Error('User cancelled starting a new execution'))
        }
      })
    } else {
      confirmPromise = new Promise(resolve => resolve())
    }
  }
  return confirmPromise
}

function generateVersionTags (generations) {
  const sortedHashes = orderBy([...generations], 'startTime', 'asc')
    .map(info => info.hashCode)
    .filter((element, index, array) => array.indexOf(element) === index)
  generations.forEach((info) => {
    info.tag = (info.hashCode) ? `V${sortedHashes.indexOf(info.hashCode) + 1}` : '-'
  })
  return generations
}

function getExecutionGroupStatus (submissions = []) {
  const { executionStatuses } = consts
  const submissionStatuses = submissions().map(s => s.status)
  if (submissionStatuses.includes(executionStatuses.PENDING)) {
    return executionStatuses.PENDING
  } else if (submissionStatuses.includes(executionStatuses.STARTED)) {
    return executionStatuses.STARTED
  } else if (submissionStatuses.includes(executionStatuses.RUNNING)) {
    return executionStatuses.RUNNING
  }
  return executionStatuses.COMPLETED
}

export { StartExecution, generateVersionTags, getExecutionGroupStatus }
export default { StartExecution, generateVersionTags, getExecutionGroupStatus }
