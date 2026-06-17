import { AuthorizedRoute } from 'pages/Route'
import atlasState from 'atlas-state'

function routes (router) {
  const predictionViewEdit = new AuthorizedRoute((analysisId, section, sourceId) => {
    Promise.all([import('./prediction-manager'), import('./components/editors/evaluation-settings-editor'), import('./components/editors/execution-settings-editor'), import('./components/editors/model-settings-editor'), import('./components/editors/population-settings-editor'), import('./components/editors/prediction-covariate-settings-editor')]).then(() => {
      atlasState.predictionAnalysis.selectedId(analysisId)
      router.setCurrentView('prediction-manager', {
        id: analysisId,
        section: section || 'specification',
        sourceId: section === 'executions' ? sourceId : null,
      })
    })
  })

  return {
    '/prediction': new AuthorizedRoute(() => {
      import('./prediction-browser').then(() => {
        router.setCurrentView('prediction-browser')
      })
    }),
    '/prediction/:analysisId:': predictionViewEdit,
    '/prediction/:analysisId:/:section:': predictionViewEdit,
    '/prediction/:analysisId:/:section:/:sourceId:': predictionViewEdit,
  }
}

export default routes

