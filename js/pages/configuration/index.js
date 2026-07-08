import ko from 'knockout'
import appState from 'atlas-state'
import buildRoutes from './routes'

const statusCss = ko.pureComputed(() => {
  if (appState.ConfigurationSource.current()) {
    return appState.ConfigurationSource.dirtyFlag().isDirty() ? 'unsaved' : 'open'
  }
  return ''
})

const navUrl = ko.pureComputed(() => {
  return appState.ConfigurationSource.current()
    ? `#/source/${(appState.ConfigurationSource.selectedId() || 0)}`
    : '#/configure'
})

export default {
  title: ko.i18n('navigation.configuration', 'Configuration'),
  buildRoutes,
  navUrl,
  icon: 'cogs',
  statusCss,
}
