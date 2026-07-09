import ko from 'knockout'

function Text (data) {
  const self = this
  data = data || {}

  self.Text = ko.observable(data.Text || null)
  self.Op = ko.observable(data.Op || 'contains')
}

export default Text
