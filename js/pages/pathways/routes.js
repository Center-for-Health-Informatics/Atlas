import ko from 'knockout'
import {
  AuthorizedRoute
} from 'pages/Route'

// return the routes that #/pathways responds to
function routes (router) {
  const pathwaysManager = new AuthorizedRoute((id, section, subId) => {
    import('./components/manager').then(() => {
      router.setCurrentView('pathways-manager', {
        analysisId: id,
        section,
        executionId: section === 'results' ? subId : null,
        sourceId: section === 'executions' ? subId : null,
      })
    })
  })

  const pathwaysManagerVersion = new AuthorizedRoute((id, version) => {
    import('./components/manager').then(() => {
      router.setCurrentView('pathways-manager', {
        analysisId: id,
        section: 'design',
        version
      })
    })
  })

  const pathwaysBrowser = new AuthorizedRoute(() => {
    import('./components/browser').then(() => {
      router.setCurrentView('pathways-browser')
    })
  })

  return {
    pathways: pathwaysBrowser,
    'pathways/:id:': pathwaysManager,
    'pathways/:id:/version/:version:': pathwaysManagerVersion,
    'pathways/:id:/:section:': pathwaysManager,
    'pathways/:id:/:section:/:subId:': pathwaysManager // for executions
  }
}

export default routes
