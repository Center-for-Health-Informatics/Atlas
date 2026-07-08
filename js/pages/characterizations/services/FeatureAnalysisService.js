import httpService from 'services/http'
import fileService from 'services/file'
import config from 'appConfig'
import authApi from 'services/AuthAPI'

function loadFeatureAnalysisList () {
  return httpService.doGet(config.webAPIRoot + 'feature-analysis?size=100000').then(res => res.data)
}

async function loadFeatureAnalysis (id) {
  return authApi.executeWithRefresh(httpService.doGet(config.webAPIRoot + `feature-analysis/${id}`).then(res => res.data))
}

function loadFeatureAnalysisDomains () {
  return httpService.doGet(config.webAPIRoot + 'feature-analysis/domains').then(res => res.data)
}

async function createFeatureAnalysis (design) {
  return authApi.executeWithRefresh(httpService.doPost(config.webAPIRoot + 'feature-analysis', design).then(res => res.data))
}

function updateFeatureAnalysis (id, design) {
  return httpService.doPut(config.webAPIRoot + `feature-analysis/${id}`, design).then(res => res.data)
}

function deleteFeatureAnalysis (id) {
  return httpService.doDelete(config.webAPIRoot + `feature-analysis/${id}`).then(res => res.data)
}

function exists (name, id) {
  return httpService.doGet(`${config.webAPIRoot}feature-analysis/${id}/exists?name=${name}`)
    .then(res => res.data)
}

function exportConceptSets (id) {
  return fileService.loadZip(`${config.webAPIRoot}feature-analysis/${id}/export/conceptset`)
}

function loadAggregates () {
  return httpService.doGet(`${config.webAPIRoot}feature-analysis/aggregates`).then(res => res.data)
}

async function copyFeatureAnalysis (id) {
  return authApi.executeWithRefresh(httpService.doGet(`${config.webAPIRoot}feature-analysis/${id}/copy`))
}

export { loadFeatureAnalysisList, loadFeatureAnalysis, loadFeatureAnalysisDomains, createFeatureAnalysis, updateFeatureAnalysis, deleteFeatureAnalysis, exists, exportConceptSets, copyFeatureAnalysis, loadAggregates }
export default { loadFeatureAnalysisList, loadFeatureAnalysis, loadFeatureAnalysisDomains, createFeatureAnalysis, updateFeatureAnalysis, deleteFeatureAnalysis, exists, exportConceptSets, copyFeatureAnalysis, loadAggregates }
