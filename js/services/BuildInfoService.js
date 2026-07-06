import appConfig from 'appConfig'
import httpService from 'services/http'

const ISSUES_PAGE_SIZE = 100

function getBuildInfo () {
  return httpService.doGet(appConfig.webAPIRoot + 'info').then(r => r.data)
}

function getIssues (repo, milestone, page) {
  return httpService.doGet(`https://api.github.com/repos/${repo}/issues?state=closed&per_page=${ISSUES_PAGE_SIZE}&page=${page}&milestone=${milestone}`)
}

export { getBuildInfo, getIssues, ISSUES_PAGE_SIZE }
export default { getBuildInfo, getIssues, ISSUES_PAGE_SIZE }

