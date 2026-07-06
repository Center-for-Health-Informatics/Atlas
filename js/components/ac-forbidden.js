import ko from 'knockout'
import view from './ac-forbidden.html?raw'
import appConfig from 'appConfig'

function forbidden (params) {
  const self = this
}

const component = {
  viewModel: forbidden,
  template: view
}

ko.components.register('forbidden', component)
export default component

