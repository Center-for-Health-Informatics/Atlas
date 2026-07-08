import { AuthorizedRoute } from 'pages/Route'

function routes (router) {
  return {
    '/tools': new AuthorizedRoute(() => {
      import('pages/tools/tool-manager').then(() => {
        router.setCurrentView('tool-manager')
      })
    }),
  }
}

export default routes
