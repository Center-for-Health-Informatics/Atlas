import ko from 'knockout'
import globalConstants from 'const'
import sharedState from 'atlas-state'
import {
  AuthorizedRoute
} from 'pages/Route'
import './components/characterizations/characterization-view-edit'

function routes (router) {
  const characterizationViewEdit = new AuthorizedRoute((id, section, subId) => {
    router.setCurrentView('characterization-view-edit', {
      characterizationId: id,
      section: section || 'design',
      executionId: section === 'results' ? subId : null,
      sourceId: section === 'executions' ? subId : null,
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
      router.setCurrentView('characterization-view-edit', {
        characterizationId: id,
        section: 'design',
        version
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
