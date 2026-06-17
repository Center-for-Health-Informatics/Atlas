import { AuthorizedRoute } from 'pages/Route'

function routes (router) {
  return {
    '/tagging': new AuthorizedRoute(() => {
      import('pages/tagging/tagging-manager').then(() => {
        router.setCurrentView('tagging-manager')
      })
    }),
  }
}

export default routes

