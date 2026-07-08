import ko from 'knockout'
import StudyWindow from 'pages/incidence-rates/inputTypes/StudyWindow'
import TimeAtRisk from 'pages/incidence-rates/inputTypes/TimeAtRisk'
import ConceptSet from 'components/conceptset/InputTypes/ConceptSet'
import StratifyRule from './StratifyRule'

function IRAnalysisExpression (data) {
  const self = this
  data = data || {}

  self.ConceptSets = ko.observableArray(data.ConceptSets && data.ConceptSets.map(function (d) { return new ConceptSet(d) }))
  self.targetIds = ko.observableArray(data.targetIds)
  self.outcomeIds = ko.observableArray(data.outcomeIds)
  self.timeAtRisk = new TimeAtRisk(data.timeAtRisk)
  self.studyWindow = ko.observable(data.studyWindow && new StudyWindow(data.studyWindow))
  self.strata = ko.observableArray(data.strata && data.strata.map(function (rule) {
    return new StratifyRule(rule, self.ConceptSets)
  }))
}
export default IRAnalysisExpression
