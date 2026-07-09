import ko from 'knockout'
import view from './loading.html?raw'

function loading (params) {
  const self = this
  self.status = params.status || ko.i18n('common.loading', 'Loading')
}

const component = {
  viewModel: loading,
  template: view
}

ko.components.register('loading', component)
export default component
