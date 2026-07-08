import ko from 'knockout'
import buildRoutes from './routes'
import appState from 'atlas-state'

const statusCss = ko.pureComputed(function () {
  if (appState.IRAnalysis.current()) {
    return appState.IRAnalysis.dirtyFlag()
      .isDirty()
      ? 'unsaved'
      : 'open'
  }
  return ''
})

const navUrl = ko.pureComputed(function () {
  let url = '#/iranalysis'
  if (appState.IRAnalysis.current()) {
    url = url + `/${(appState.IRAnalysis.current().id() || 0)}`
  }
  return url
})

export default {
  title: ko.i18n('navigation.incidencerate', 'Incidence Rates'),
  buildRoutes,
  icon: 'bolt',
  statusCss,
  navUrl
}
