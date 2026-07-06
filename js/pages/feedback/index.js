import ko from 'knockout'
import buildRoutes from './routes'

export default {
  title: ko.i18n('navigation.feedback', 'Feedback'),
  buildRoutes,
  navUrl: () => '#/feedback',
  icon: 'comment',
  statusCss: () => ''
}
