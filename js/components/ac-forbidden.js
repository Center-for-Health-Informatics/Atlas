import ko from 'knockout'
import view from './ac-forbidden.html?raw'

function forbidden (params) {
}

const component = {
  viewModel: forbidden,
  template: view
}

ko.components.register('forbidden', component)
export default component
