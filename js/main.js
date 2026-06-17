import $ from 'jquery'
import ko from 'knockout'
import 'bootstrap'
import 'ko.sortable'
import 'databindings'
import 'services/PluginRegistry'

// Global styles (were loaded via AMD css! plugin)
import './styles/font-awesome.min.css'
import './styles/bootstrap.min.css'
import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css'
import './styles/bootstrap-theme.min.css'
import './styles/jquery.dataTables.min.css'
import './styles/tabs.css'
import './styles/jquery-ui.css'
import './styles/buttons.dataTables.min.css'
import './styles/atlas.css'
import './styles/chart.css'
import './styles/achilles.css'
import 'bootstrap-select/dist/css/bootstrap-select.css'
import './styles/buttons.css'
import './styles/cartoon.css'
import './styles/d3.slider.css'
import './styles/exploreCohort.css'
import './styles/jquery.dataTables.colVis.css'
import './styles/jquery.datatables.tabletools.css'
import './styles/prism.css'
import './styles/switch-button.css'

import Application from './Application'
import appConfig from 'appConfig'
import constants from 'const'
import router from 'pages/Router'
import sharedState from 'atlas-state'
import './components/loading'
import './components/userbar/user-bar'
import './components/welcome'
import './components/white-page'
import './components/terms-and-conditions/terms-and-conditions'

$.fn.bstooltip = $.fn.tooltip
ko.options.deferUpdates = true

const app = new Application(router)
app.bootstrap()
  .then(() => app.checkOAuthError())
  .then(() => app.synchronize())
  .then(() => {
    if (appConfig.externalLibraries?.length) {
      console.warn('External plugins not loaded in ESM mode:', appConfig.externalLibraries)
    }
  })
  .catch(er => {
    sharedState.appInitializationStatus(constants.applicationStatuses.failed)
    console.error('App initialization failed', er)
  })
