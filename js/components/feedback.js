import ko from 'knockout'
import view from './feedback.html?raw'
import config from 'appConfig'

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
export default component
