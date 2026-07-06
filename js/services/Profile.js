import httpService from 'services/http'
import config from 'appConfig'
import authApi from 'services/AuthAPI'

const getProfile = function (sourceKey, personId, cohort) {
  const data = {
    cohort: cohort || 0,
  }
  const response = httpService.doGet(`${config.webAPIRoot}${sourceKey}/person/${personId}`, data).then(({ data }) => data)
  response.catch((er) => {
    console.error('Can\'t find person')
  })

  return response
}

export { getProfile }
export default { getProfile }

