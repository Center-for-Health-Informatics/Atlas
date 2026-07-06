import ko from 'knockout'
import buildRoutes from './routes'

export default {
  title: ko.i18n('navigation.jobs', 'Jobs'),
  buildRoutes,
  navUrl: () => '#/jobs',
  icon: 'tasks',
  statusCss: () => ''
}
