import ko from 'knockout'

function FieldOffset (data, defaultDateField = 'StartDate', defaultOffset = 0) {
  const self = this
  data = data || {}

  self.DateField = ko.observable(data.DateField || defaultDateField)
  self.Offset = ko.observable(data.Offset || defaultOffset)
}

FieldOffset.prototype.toJSON = function () {
  return this
}

export default FieldOffset
