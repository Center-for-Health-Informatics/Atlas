import ko from 'knockout'
import appState from 'atlas-state'
import buildRoutes from './routes'
import constants from './const'

const statusCss = ko.pureComputed(() => {
  if (appState.RepositoryConceptSet.current()) {
    return appState.RepositoryConceptSet.dirtyFlag().isDirty() ? 'unsaved' : 'open'
  }
  return ''
})

const navUrl = ko.pureComputed(function () {
  let url = '#/conceptsets'
  if (appState.RepositoryConceptSet.current()) {
    url = `#${constants.paths.mode(appState.RepositoryConceptSet.current().id || 0)}`
  }
  return url
})

export default {
  title: ko.i18n('navigation.conceptsets', 'Concept Sets'),
  buildRoutes,
  navUrl,
  icon: 'shopping-cart',
  statusCss,
}
