import {
  AuthorizedRoute
} from 'pages/Route'

// Every route here loads its view component dynamically, like every other
// page's routes.js. `characterization-view-edit` used to be a static import at
// the top of this file -- the only static component import in any routes.js --
// which put the whole characterizations component tree into the eager Router
// chunk, and with it conceptset-list, cohort-definition-browser,
// ConceptSetStore and JSZip. See MIGRATION_STATUS.md.
function routes (router) {
  const characterizationViewEdit = new AuthorizedRoute((id, section, subId) => {
    import('./components/characterizations/characterization-view-edit').then(() => {
      router.setCurrentView('characterization-view-edit', {
        characterizationId: id,
        section: section || 'design',
        executionId: section === 'results' ? subId : null,
        sourceId: section === 'executions' ? subId : null,
      })
    })
  })

  const featureAnalysisViewEdit = new AuthorizedRoute((id, section) => {
    import('./components/feature-analyses/feature-analysis-view-edit').then(() => {
      router.setCurrentView('feature-analysis-view-edit', {
        id,
        section: section || 'design',
      })
    })
  })

  return {
    'cc/characterizations': new AuthorizedRoute(() => {
      import('./components/characterizations/characterizations-list').then(() => {
        router.setCurrentView('characterizations-list')
      })
    }),
    'cc/characterizations/:id:/version/:version:': new AuthorizedRoute((id, version) => {
      import('./components/characterizations/characterization-view-edit').then(() => {
        router.setCurrentView('characterization-view-edit', {
          characterizationId: id,
          section: 'design',
          version
        })
      })
    }),
    'cc/characterizations/:id:': characterizationViewEdit,
    'cc/characterizations/:id:/:section:': characterizationViewEdit,
    'cc/characterizations/:id:/:section:/:subId:': characterizationViewEdit, // for executions

    'cc/feature-analyses': new AuthorizedRoute(() => {
      import('./components/feature-analyses/feature-analyses-list').then(() => {
        router.setCurrentView('feature-analyses-list')
      })
    }),
    'cc/feature-analyses/:id:': featureAnalysisViewEdit,
    'cc/feature-analyses/:id:/:section:': featureAnalysisViewEdit,
  }
}

export default routes
