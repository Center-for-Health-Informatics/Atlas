import config from 'appConfig'
import authApi from 'services/AuthAPI'
import httpService from 'services/http'

function getDefaultCovariateSettings (temporal = false) {
  return httpService.doGet(config.webAPIRoot + 'featureextraction/defaultcovariatesettings?temporal=' + temporal).catch(authApi.handleAccessDenied)
}

const api = {
  getDefaultCovariateSettings,
}

export default api
