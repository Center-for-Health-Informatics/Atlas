import { AuthorizedRoute } from 'pages/Route'

function routes (router) {
  return {
    '/datasources': new AuthorizedRoute(() => {
      import('./data-sources').then(() => {
        router.setCurrentView('data-sources')
      })
    }),
    '/datasources/:sourceKey/:reportName': new AuthorizedRoute((sourceKey, reportName) => {
      import('./data-sources').then(() => {
        router.setCurrentView('data-sources', {
          reportName: reportName ? decodeURIComponent(reportName) : reportName,
          sourceKey: sourceKey ? decodeURIComponent(sourceKey) : sourceKey,
        })
      })
    }),
  }
}

export default routes
