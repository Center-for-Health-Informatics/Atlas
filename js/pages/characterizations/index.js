import ko from 'knockout'
import sharedState from 'atlas-state'
import constants from './const'
import buildRoutes from './routes'

const statusCss = ko.pureComputed(() => {
  if (sharedState.CohortCharacterization.current()) {
    return sharedState.CohortCharacterization.dirtyFlag().isDirty() ? 'unsaved' : 'open'
  }
  if (sharedState.FeatureAnalysis.current()) {
    return sharedState.FeatureAnalysis.dirtyFlag().isDirty() ? 'unsaved' : 'open'
  }
  return ''
})

const navUrl = ko.pureComputed(function () {
  let url = '#/cc/characterizations'
  if (sharedState.CohortCharacterization.current()) {
    url = url + `/${(sharedState.CohortCharacterization.current().id || 0)}`
  } else if (sharedState.FeatureAnalysis.current()) {
    url = `#/cc/feature-analyses/${(sharedState.FeatureAnalysis.current().id || 0)}`
  }
  return url
})

export default {
  title: ko.i18n('navigation.characterizations', constants.pageTitle()),
  buildRoutes,
  icon: 'chart-line',
  statusCss,
  navUrl,
}

