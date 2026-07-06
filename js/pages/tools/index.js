import ko from 'knockout'
import buildRoutes from './routes'

export default {
  title: ko.i18n('navigation.tools', 'Tools'),
  buildRoutes,
  navUrl: () => '#/tools',
  icon: 'toolbox',
  statusCss: () => ''
}
