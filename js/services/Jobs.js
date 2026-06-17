import httpService from 'services/http'
import config from 'appConfig'
import constants from 'const'

export default class JobsService {
  static getList () {
    return httpService.doGet(constants.apiPaths.jobs())
      .then(({ data: jobs } = { data: { content: [] } }) => jobs.content)
  }

  static get (id) {
    return httpService.doGet(constants.apiPaths.job(id))
  }

  static getByName (name, type) {
    return httpService.doGet(constants.apiPaths.jobByName(name, type))
  }
}

