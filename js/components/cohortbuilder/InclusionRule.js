define(function (require, exports) {
  const ko = require('knockout')
  const CriteriaGroup = require('components/cohortbuilder/CriteriaGroup')

  function InclusionRule (data, conceptSets) {
    const self = this
    var data = data || {}

    self.name = ko.observable(data.name || null)
    self.description = ko.observable(data.description || null)
    self.expression = new CriteriaGroup(data.expression, conceptSets)
  }

  return InclusionRule
})
