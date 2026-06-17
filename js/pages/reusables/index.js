import ko from 'knockout'
import buildRoutes from './routes'
import appState from 'atlas-state'

const statusCss = ko.pureComputed(function () {
  if (appState.Reusable.current()) {
    return appState.Reusable.dirtyFlag()
      .isDirty()
      ? 'unsaved'
      : 'open'
  }
  return ''
})

const navUrl = ko.pureComputed(function () {
  let url = '#/reusables'
  if (appState.Reusable.current()) {
    url = url + `/${(appState.Reusable.current().id || 0)}`
  }
  return url
})

export default {
  title: ko.i18n('navigation.reusables', 'Reusables'),
  buildRoutes,
  icon: 'recycle',
  statusCss,
  navUrl
}

