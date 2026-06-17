import config from 'appConfig'
import ohdsiUtil from 'assets/ohdsi.util'
import authApi from 'services/AuthAPI'
import momentApi from 'services/MomentAPI'
import httpService from 'services/http'

const executionPath = 'executionservice'

function runExecution (sourceKey, analysisId, analysisType, template) {
  const data = {
    template,
    sourceKey,
    exposureTable: 'exposure_table',
    outcomeTable: 'outcome',
    cdmVersion: 5,
    workFolder: 'workfolder',
    analysisType,
    cohortId: analysisId,
  }
  return httpService.doPost(`${config.api.url}${executionPath}/execution/run`, data)
}

function loadExecutions (analysisType, analysisId, callback) {
  ohdsiUtil.cachedAjax({
    url: `${config.api.url}${executionPath}/${analysisType}/${analysisId}/executions`,
    method: 'GET',
    contentType: 'application/json',
    error: authApi.handleAccessDenied,
    success: function (response) {
      response = response.sort(function (a, b) {
        return a.executed - b.executed
      })

      $.each(response, function (i, d) {
        const executedTimestamp = new Date(d.executed)
        d.executedCaption = momentApi.formatDateTime(executedTimestamp)

        if (d.duration > 0) {
          d.durationCaption = momentApi.formatDuration(d.duration * 1000)
        } else {
          d.durationCaption = 'n/a'
        }
        callback(d)
      })
    }
  })
}

function getEngineStatus () {
  return httpService.doGet(`${config.api.url}${executionPath}/status`)
}

function viewResults (executionId) {
  window.open(`${config.api.url}${executionPath}/execution/results/${executionId}`)
}

function checkExecutionEngineStatus (isAuthenticated) {
  if (authApi.isPermittedGetExecutionService()) {
    if (isAuthenticated && config.useExecutionEngine) {
      getEngineStatus().then(({ data: v }) => {
        config.api.isExecutionEngineAvailable(v.status === 'ONLINE')
      })
    }
  } else {
    console.warn('There isn\'t permission to get execution engine status')
  }
}

const api = {
  runExecution,
  loadExecutions,
  viewResults,
  getEngineStatus,
  executionPath,
  checkExecutionEngineStatus,
}

export default api

