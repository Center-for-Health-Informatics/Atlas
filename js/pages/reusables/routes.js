import {
  AuthorizedRoute
} from 'pages/Route'

function routes (router) {
  const reusablesManager = new AuthorizedRoute((id, section) => {
    import('./components/manager').then(() => {
      router.setCurrentView('reusables-manager', {
        designId: id,
        section,
      })
    })
  })

  const reusablesManagerVersion = new AuthorizedRoute((id, version) => {
    import('./components/manager').then(() => {
      router.setCurrentView('reusables-manager', {
        designId: id,
        section: 'design',
        version
      })
    })
  })

  const reusablesBrowser = new AuthorizedRoute(() => {
    import('./components/browser').then(() => {
      router.setCurrentView('reusables-browser')
    })
  })

  return {
    reusables: reusablesBrowser,
    'reusables/:id:': reusablesManager,
    'reusables/:id:/version/:version:': reusablesManagerVersion,
    'reusables/:id:/:section:': reusablesManager,
    'reusables/:id:/:section:/:subId:': reusablesManager // for executions
  }
}

export default routes
