import { Route } from 'pages/Route'

function routes (router) {
  return {
    '/feedback': new Route(() => {
      import('feedback').then(() => {
        router.setCurrentView('feedback')
      })
    }),
  }
}

export default routes

