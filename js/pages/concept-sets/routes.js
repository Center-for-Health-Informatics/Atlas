import { AuthorizedRoute } from 'pages/Route'

function routes (router) {
  const detailsRoute = new AuthorizedRoute((conceptSetId, mode = 'conceptset-expression') => {
    import('./conceptset-manager').then(() => {
      router.setCurrentView('conceptset-manager', {
        conceptSetId: conceptSetId && parseInt(conceptSetId),
        mode,
      })
    })
  })

  return {
    '/conceptset/:conceptSetId': detailsRoute,
    '/conceptset/:conceptSetId/:mode': detailsRoute,
    '/conceptset/:conceptSetId/version/:version': new AuthorizedRoute((conceptSetId, version) => {
      import('./conceptset-manager').then(() => {
        router.setCurrentView('conceptset-manager', {
          conceptSetId: conceptSetId && parseInt(conceptSetId),
          version,
          mode: 'conceptset-expression'
        })
      })
    }),
    '/conceptsets': new AuthorizedRoute(() => {
      import('./conceptset-browser').then(() => {
        router.setCurrentView('conceptset-browser')
      })
    }),
    '/concept/:conceptId:': new AuthorizedRoute((conceptId) => {
      import('./components/concept/concept-manager').then(() => {
        router.setCurrentView('concept-manager', { conceptId })
      })
    }),
  }
}

export default routes
