import ko from 'knockout'
import buildRoutes from './routes'

export default {
  title: ko.i18n('navigation.profiles', 'Profiles'),
  buildRoutes,
  navUrl: () => '#/profiles',
  icon: 'user',
  statusCss: () => ''
}

