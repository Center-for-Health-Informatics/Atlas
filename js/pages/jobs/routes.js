import { AuthorizedRoute } from 'pages/Route'

function routes (router) {
  return {
    '/jobs': new AuthorizedRoute(() => {
      import('pages/jobs/job-manager').then(() => {
        router.setCurrentView('job-manager')
      })
    }),
  }
}

export default routes

