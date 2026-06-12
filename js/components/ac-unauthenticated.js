define(['knockout', 'text!./unauthenticated.html', 'appConfig', 'services/AuthAPI'], function (ko, view, appConfig, authApi) {
  function unauthenticated (params) {
    const self = this
    self.signInOpened = authApi.signInOpened
  }

  const component = {
    viewModel: unauthenticated,
    template: view
  }

  ko.components.register('unauthenticated', component)
  return component
})
