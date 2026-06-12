define(function (require, exports) {
  const ko = require('knockout')
  const StudyWindow = require('pages/incidence-rates/inputTypes/StudyWindow')
  const TimeAtRisk = require('pages/incidence-rates/inputTypes/TimeAtRisk')
  const ConceptSet = require('components/conceptset/InputTypes/ConceptSet')
  const StratifyRule = require('./StratifyRule')

  function IRAnalysisExpression (data) {
    const self = this
    var data = data || {}

    self.ConceptSets = ko.observableArray(data.ConceptSets && data.ConceptSets.map(function (d) { return new ConceptSet(d) }))
    self.targetIds = ko.observableArray(data.targetIds)
    self.outcomeIds = ko.observableArray(data.outcomeIds)
    self.timeAtRisk = new TimeAtRisk(data.timeAtRisk)
    self.studyWindow = ko.observable(data.studyWindow && new StudyWindow(data.studyWindow))
    self.strata = ko.observableArray(data.strata && data.strata.map(function (rule) {
      return new StratifyRule(rule, self.ConceptSets)
    }))
  }
  return IRAnalysisExpression
})
