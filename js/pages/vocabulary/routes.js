import { AuthorizedRoute } from 'pages/Route'

function routes (router) {
  const search = new AuthorizedRoute(() => {
    import('./vocabulary').then(() => {
      const view = 'vocabulary'
      const params = {
        query: router.qs().query ? unescape(router.qs().query) : null,
      }
      router.setCurrentView(view, params)
    })
  })

  const legacySearch = new AuthorizedRoute((query) => {
    window.location = '#/search?query=' + query
  })

  return {
    'search/:query:': legacySearch,
    '/search': search,
    search,
  }
}

export default routes
