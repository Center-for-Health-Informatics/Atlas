import httpService from 'services/http'
import config from 'appConfig'

function loadSourceList () {
  return httpService
    .doGet(config.webAPIRoot + 'source/sources')
    .then(res => res.data)
}

export { loadSourceList }
export default { loadSourceList }
