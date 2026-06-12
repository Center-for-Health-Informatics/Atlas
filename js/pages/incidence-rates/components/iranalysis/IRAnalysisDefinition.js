define(function (require, exports) {
  const ko = require('knockout')
  const IRAnalysisExpression = require('./IRAnalysisExpression')

  function IRAnalysisDefinition (data) {
    const self = this
    var data = data || {}

    self.id = ko.observable(data.id || null)
    self.name = ko.observable(data.name || ko.i18n('const.newEntityNames.incidenceRate', 'New Incidence Rate Analysis')())
    self.description = ko.observable(data.description || null)
    self.expression = ko.observable(new IRAnalysisExpression(data.expression))
    self.createdBy = ko.observable(data.createdBy || null)
    self.createdDate = ko.observable(data.createdDate || null)
    self.modifiedBy = ko.observable(data.modifiedBy || null)
    self.modifiedDate = ko.observable(data.modifiedDate || null)
    self.tags = ko.observableArray(data.tags)
  }
  return IRAnalysisDefinition
})
