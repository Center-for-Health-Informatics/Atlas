import httpService from 'services/http'
import config from 'appConfig'
import consts from 'pages/configuration/users-import/const'

function listJobs () {
  return httpService
    .doGet(consts.Api.userImportJob)
    .then(res => res.data)
}

function getJob (id) {
  return httpService
    .doGet(consts.Api.userImportJob + '/' + id)
    .then(res => res.data)
}

function createJob (job) {
  return httpService
    .doPost(consts.Api.userImportJob, job)
    .then(res => res.data)
}

function updateJob (id, job) {
  return httpService
    .doPut(consts.Api.userImportJob + '/' + id, job)
    .then(res => res.data)
}

function deleteJob (id) {
  return httpService
    .doDelete(consts.Api.userImportJob + '/' + id)
    .then(res => res.data)
}

function mapRoleGroups (rolesList) {
  return rolesList.map(item => ({
    role: { id: item.id, role: item.role },
    groups: item.groups,
  }))
}

function getJobHistory (id) {
  return httpService
    .doGet(consts.Api.userImportJob + `/${id}/history`)
    .then(res => res.data)
}

export { listJobs, getJob, createJob, updateJob, deleteJob, mapRoleGroups, getJobHistory }
export default { listJobs, getJob, createJob, updateJob, deleteJob, mapRoleGroups, getJobHistory }

