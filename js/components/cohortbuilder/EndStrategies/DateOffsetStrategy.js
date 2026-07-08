import ko from 'knockout'

function DateOffsetStrategy (data, conceptSets) {
  const self = this
  data = data || {}

  self.DateField = ko.observable(data.DateField || 'StartDate')
  self.Offset = ko.observable(data.Offset || 0)
}

DateOffsetStrategy.prototype.toJSON = function () {
  return this
}

export default DateOffsetStrategy
