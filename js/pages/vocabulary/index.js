import ko from 'knockout'
import buildRoutes from './routes'

export default {
  title: ko.i18n('navigation.search', 'Search'),
  buildRoutes,
  navUrl: () => '#/search',
  icon: 'search',
  statusCss: () => ''
}

