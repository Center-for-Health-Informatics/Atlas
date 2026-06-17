import ko from 'knockout'
import buildRoutes from './routes'

export default {
  title: ko.i18n('navigation.home', 'Home'),
  buildRoutes,
  navUrl: () => '#/home',
  icon: 'home',
  statusCss: () => ''
}

