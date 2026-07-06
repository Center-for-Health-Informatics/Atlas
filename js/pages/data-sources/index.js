import ko from 'knockout'
import buildRoutes from './routes'

export default {
  title: ko.i18n('navigation.datasources', 'Data Sources'),
  buildRoutes,
  navUrl: () => '#/datasources',
  icon: 'database',
  statusCss: () => ''
}
