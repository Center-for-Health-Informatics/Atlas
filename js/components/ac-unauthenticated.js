import ko from 'knockout'
import view from './ac-unauthenticated.html?raw'
import appConfig from 'appConfig'
import authApi from 'services/AuthAPI'

function unauthenticated (params) {
  const self = this
  self.signInOpened = authApi.signInOpened
}

const component = {
  viewModel: unauthenticated,
  template: view
}

ko.components.register('unauthenticated', component)
export default component
