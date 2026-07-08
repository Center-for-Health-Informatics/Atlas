import ko from 'knockout'
import CriteriaGroup from './CriteriaGroup'
import ConceptSet from 'components/conceptset/InputTypes/ConceptSet'
import PrimaryCriteria from './PrimaryCriteria'
import InclusionRule from './InclusionRule'
import * as EndStrategies from './EndStrategies'
import * as CriteriaTypes from './CriteriaTypes'
import Period from './InputTypes/Period'

function CohortExpression (data) {
  const self = this
  data = data || {}

  self.ConceptSets = ko.observableArray(data.ConceptSets && data.ConceptSets.map(function (d) { return new ConceptSet(d) }))
  self.PrimaryCriteria = ko.observable(new PrimaryCriteria(data.PrimaryCriteria, self.ConceptSets))
  self.AdditionalCriteria = ko.observable(data.AdditionalCriteria && new CriteriaGroup(data.AdditionalCriteria, self.ConceptSets))
  self.QualifiedLimit = { Type: ko.observable(data.QualifiedLimit && data.QualifiedLimit.Type || 'First') }
  self.ExpressionLimit = { Type: ko.observable(data.ExpressionLimit && data.ExpressionLimit.Type || 'First') }
  self.InclusionRules = ko.observableArray(data.InclusionRules && data.InclusionRules.map(function (rule) {
    return new InclusionRule(rule, self.ConceptSets)
  }))
  self.EndStrategy = ko.observable(data.EndStrategy && EndStrategies.GetStrategyFromObject(data.EndStrategy, self.ConceptSets))

  self.CensoringCriteria = ko.observableArray(data.CensoringCriteria && data.CensoringCriteria.map(function (criteria) {
    return CriteriaTypes.GetCriteriaFromObject(criteria, self.ConceptSets)
  }))
  self.CollapseSettings = { CollapseType: ko.observable(data.CollapseSettings && data.CollapseSettings.CollapseType || 'ERA'), EraPad: ko.observable(data.CollapseSettings && data.CollapseSettings.EraPad || 0) }
  self.CensorWindow = ko.observable(new Period(data.CensorWindow))

  self.cdmVersionRange = data.cdmVersionRange || null
}
export default CohortExpression
