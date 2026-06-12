define(['knockout', 'text!./forbidden.html', 'appConfig'], function (ko, view, appConfig) {
  function forbidden (params) {
    const self = this
  }

  const component = {
    viewModel: forbidden,
    template: view
  }

  ko.components.register('forbidden', component)
  return component
})
