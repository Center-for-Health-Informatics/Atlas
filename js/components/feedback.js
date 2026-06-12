define(['knockout', 'text!./feedback.html', 'appConfig'], function (ko, view, config) {
  function feedback () {
    const self = this
    self.supportMail = config.supportMail
    self.supportMailRef = 'mailto:' + config.supportMail
    self.contacts = config.feedbackContacts
    self.feedbackTemplate = config.feedbackCustomHtmlTemplate
  }
  const component = {
    viewModel: feedback,
    template: view,
  }

  ko.components.register('feedback', component)
  return component
})
