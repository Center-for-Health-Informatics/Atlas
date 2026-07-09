const debug = process.env.NODE_ENV !== 'production'
const log = m => { if (debug) { console.log('[LOAD]', m); document.title = m } }

async function run () {
  log('jquery'); const { default: $ } = await import('jquery')
  log('knockout'); const { default: ko } = await import('knockout')
  window.jQuery = window.$ = $
  log('bootstrap'); await import('bootstrap')
  log('ko.sortable'); await import('ko.sortable')
  log('databindings'); await import('databindings')
  log('services/PluginRegistry'); await import('services/PluginRegistry')

  log('css'); await import('./styles/font-awesome.min.css')
  await import('./styles/bootstrap.min.css')
  await import('eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css')
  await import('./styles/bootstrap-theme.min.css')
  await import('./styles/jquery.dataTables.min.css')
  await import('./styles/tabs.css')
  await import('./styles/jquery-ui.css')
  await import('./styles/buttons.dataTables.min.css')
  await import('./styles/atlas.css')
  await import('./styles/chart.css')
  await import('./styles/achilles.css')
  await import('bootstrap-select/dist/css/bootstrap-select.css')
  await import('./styles/buttons.css')
  await import('./styles/cartoon.css')
  await import('./styles/exploreCohort.css')
  await import('./styles/jquery.dataTables.colVis.css')
  await import('./styles/jquery.datatables.tabletools.css')
  await import('./styles/prism.css')
  await import('./styles/switch-button.css')

  log('Application'); const { default: Application } = await import('./Application')
  log('appConfig'); const { default: appConfig } = await import('appConfig')
  log('const'); const { default: constants } = await import('const')
  log('pages/Router'); const { default: router } = await import('pages/Router')
  log('atlas-state'); const { default: sharedState } = await import('atlas-state')
  log('loading'); await import('./components/loading')
  log('user-bar'); await import('./components/userbar/user-bar')
  log('welcome'); await import('./components/welcome')
  log('white-page'); await import('./components/white-page')
  log('terms-and-conditions'); await import('./components/terms-and-conditions/terms-and-conditions')

  log('bootstrap done')
  $.fn.bstooltip = $.fn.tooltip
  ko.options.deferUpdates = true

  const app = new Application(router)
  app.bootstrap()
    .then(() => app.checkOAuthError())
    .then(() => app.synchronize())
    .then(() => {
      if (appConfig.externalLibraries?.length) {
        console.warn('External plugins not loaded in ESM mode:', appConfig.externalLibraries)
      }
    })
    .catch(er => {
      sharedState.appInitializationStatus(constants.applicationStatuses.failed)
      console.error('App initialization failed', er)
    })
}

run().catch(err => {
  if (debug) {
    console.error('[LOAD FAILED]', err)
    document.title = 'FAILED: ' + err.message
  }
})
