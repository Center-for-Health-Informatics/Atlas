define(function (require, exports) {
  const ko = require('knockout')
  const CohortExpression = require('./CohortExpression')

  function CohortDefinition (data) {
    const self = this
    var data = data || {}

    self.id = ko.observable(data.id)
    self.name = ko.observable(data.name || null)
    self.description = ko.observable(data.description || null)
    self.expressionType = (data.expressionType || 'SIMPLE_EXPRESSION')
    self.expression = ko.observable(new CohortExpression(data.expression))
    self.createdBy = ko.observable(data.createdBy || null)
    self.createdDate = ko.observable(data.createdDate || null)
    self.modifiedBy = ko.observable(data.modifiedBy || null)
    self.modifiedDate = ko.observable(data.modifiedDate || null)
    self.tags = ko.observableArray(data.tags)
  }
  return CohortDefinition
})
