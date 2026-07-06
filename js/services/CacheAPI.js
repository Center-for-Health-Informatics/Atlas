import config from 'appConfig'
import authApi from 'services/AuthAPI'
import httpService from 'services/http'

function clearCache () {
  return httpService.doGet(config.webAPIRoot + 'cache/clear')
    .then(res => res.data)
    .catch((error) => {
      console.log('Error: ' + error)
      authApi.handleAccessDenied(error)
    })
}

export { clearCache }
export default { clearCache }

