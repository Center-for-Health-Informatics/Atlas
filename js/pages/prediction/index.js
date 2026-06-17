import ko from 'knockout'
import buildRoutes from './routes'
import appState from 'atlas-state'
import constants from './const'

const statusCss = ko.pureComputed(function () {
  if (appState.predictionAnalysis.current()) {
    return appState.predictionAnalysis.dirtyFlag().isDirty() ? 'unsaved' : 'open'
  }
  return ''
})

const navUrl = ko.pureComputed(function () {
  let url = constants.paths.browser()
  if (appState.predictionAnalysis.current()) {
    if (appState.predictionAnalysis.current().id() != null && appState.predictionAnalysis.current().id() > 0) {
      url = appState.predictionAnalysis.analysisPath(appState.predictionAnalysis.current().id())
    } else {
      url = constants.paths.createAnalysis()
    }
  }
  return url
})

export default {
  title: ko.i18n('navigation.prediction', 'Prediction'),
  buildRoutes,
  navUrl,
  icon: 'heartbeat',
  statusCss,
}

