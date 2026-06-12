define(['knockout', 'text!./loading.html', 'appConfig'], function (ko, view, config) {
  function loading (params) {
    const self = this
    self.status = params.status || ko.i18n('common.loading', 'Loading')
  }

  const component = {
    viewModel: loading,
    template: view
  }

  ko.components.register('loading', component)
  return component
})
