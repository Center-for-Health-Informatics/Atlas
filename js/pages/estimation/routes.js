import { AuthorizedRoute } from 'pages/Route'
import atlasState from 'atlas-state'

function routes (router) {
  const ccaViewEdit = new AuthorizedRoute((estimationId, section, sourceId) => {
    import('./cca-manager').then(() => {
      atlasState.estimationAnalysis.selectedId(estimationId)
      router.setCurrentView('cca-manager', {
        id: estimationId,
        section: section || 'specification',
        sourceId: section === 'executions' ? sourceId : null,
      })
    })
  })

  return {
    '/estimation': new AuthorizedRoute(() => {
      import('./estimation-browser').then(() => {
        router.setCurrentView('estimation-browser')
      })
    }),
    '/estimation/cca/:estimationId:': ccaViewEdit,
    '/estimation/cca/:estimationId:/:section:': ccaViewEdit,
    '/estimation/cca/:estimationId:/:section:/:sourceId:': ccaViewEdit,
  }
}

export default routes

