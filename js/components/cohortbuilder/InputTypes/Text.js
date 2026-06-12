define(['knockout'], function (ko) {
  const debug = false

  function Text (data) {
    const self = this
    data = data || {}

    self.Text = ko.observable(data.Text || null)
    self.Op = ko.observable(data.Op || 'contains')
  }

  return Text
})
