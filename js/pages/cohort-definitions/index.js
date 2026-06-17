import ko from 'knockout'
import appState from 'atlas-state'
import buildRoutes from './routes'
import constants from './const'

const statusCss = ko.pureComputed(() => {
  if (appState.CohortDefinition.current()) {
    return appState.CohortDefinition.dirtyFlag().isDirty() ? 'unsaved' : 'open'
  }
  return ''
})

const navUrl = ko.pureComputed(function () {
  let url = '#/cohortdefinitions'
  if (appState.CohortDefinition.current()) {
    url = `#${constants.paths.details(appState.CohortDefinition.current().id() || 0)}`
  }
  return url
})

export default {
  title: ko.i18n('navigation.cohortdefinitions', 'Cohort Definitions'),
  buildRoutes,
  navUrl,
  icon: 'users',
  statusCss,
}

