import ko from 'knockout'
import buildRoutes from './routes'
import appState from 'atlas-state'
import constants from './const'

const statusCss = ko.pureComputed(function () {
  if (appState.estimationAnalysis.current()) { return appState.estimationAnalysis.dirtyFlag().isDirty() ? 'unsaved' : 'open' }
  return ''
})

const navUrl = ko.pureComputed(function () {
  let url = constants.paths.browser()
  if (appState.estimationAnalysis.current()) {
    if (appState.estimationAnalysis.current().id() != null && appState.estimationAnalysis.current().id() > 0) {
      url = appState.estimationAnalysis.analysisPath(appState.estimationAnalysis.current().id())
    } else {
      url = constants.paths.createCcaAnalysis()
    }
  }
  return url
})

export default {
  title: ko.i18n('navigation.estimation', 'Estimation'),
  buildRoutes,
  navUrl,
  icon: 'balance-scale',
  statusCss
}

