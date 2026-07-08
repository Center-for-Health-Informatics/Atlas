import ko from 'knockout'
import buildRoutes from './routes'
import appConfig from 'config/app'

export default {
  title: ko.i18n('navigation.tagging', 'Tagging'),
  buildRoutes,
  navUrl: () => '#/tagging',
  icon: 'tags',
  statusCss: () => '',
  hidden: !appConfig.enableTaggingSection
}
