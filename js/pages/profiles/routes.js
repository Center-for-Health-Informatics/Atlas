import { AuthorizedRoute } from 'pages/Route'

function routes (router) {
  return {
    '/profiles/?((\w|.)*)': new AuthorizedRoute((path) => {
      Promise.all([import('./profile-manager'), import('components/entityBrowsers/cohort-definition-browser')]).then(() => {
        path = path.split('/')
        const params = {}
        params.sourceKey = (path[0] || null)
        params.personId = (path[1] || null)
        params.cohortDefinitionId = (path[2] || null)

        router.setCurrentView('profile-manager', params)
      })
    }),
  }
}

export default routes
