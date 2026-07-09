import ko from 'knockout'
import constants from './const'
import buildRoutes from './routes'
import appState from 'atlas-state'

const statusCss = ko.pureComputed(function () {
  if (appState.CohortPathways.current()) {
    return appState.CohortPathways.dirtyFlag()
      .isDirty()
      ? 'unsaved'
      : 'open'
  }
  return ''
})

const navUrl = ko.pureComputed(function () {
  let url = '#/pathways'
  if (appState.CohortPathways.current()) {
    url = url + `/${(appState.CohortPathways.current().id || 0)}`
  }
  return url
})

export default {
  title: ko.i18n('navigation.pathways', constants.pageTitle),
  buildRoutes,
  icon: 'sitemap',
  statusCss,
  navUrl
}
