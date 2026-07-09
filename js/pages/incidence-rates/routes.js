import { AuthorizedRoute } from 'pages/Route'
import atlasState from 'atlas-state'

function routes (router) {
  return {
    '/iranalysis': new AuthorizedRoute(() => {
      import('./ir-browser').then(() => {
        router.setCurrentView('ir-browser')
      })
    }),
    '/iranalysis/:analysisId:/version/:version:': new AuthorizedRoute((analysisId, version) => {
      import('./ir-manager').then(() => {
        atlasState.IRAnalysis.selectedId(+analysisId)
        router.setCurrentView('ir-manager', { analysisId, activeTab: 'definition', version })
      })
    }),
    // eslint-disable-next-line no-useless-escape -- this route pattern is compiled into a RegExp by director; \w must be preserved
    '/iranalysis/:analysisId:/?((\w|.)*)': new AuthorizedRoute((analysisId, path) => {
      analysisId = parseInt(analysisId)
      path = path.split('/')
      let activeTab = null
      if (path.length > 0 && path[0] !== '') {
        activeTab = path[0]
      }
      let selectedSourceId = null
      // source_id
      if (path.length > 1 && path[1] !== '') {
        selectedSourceId = parseInt(path[1])
      }
      import('./ir-manager').then(() => {
        atlasState.IRAnalysis.selectedId(+analysisId)
        atlasState.IRAnalysis.selectedSourceId(+selectedSourceId)
        router.setCurrentView('ir-manager', { analysisId, activeTab })
      })
    }),
  }
}

export default routes
