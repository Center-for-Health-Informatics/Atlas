import ko from 'knockout'
import $ from 'jquery'
import options from '../options'
import CriteriaGroup from '../CriteriaGroup'
import * as criteriaTypes from '../CriteriaTypes'
import CohortExpression from '../CohortExpression'
import InclusionRule from '../InclusionRule'
import template from './CohortExpressionEditorTemplate.html?raw'
import constants from '../const'
import './EndStrategyEditor'
import 'databindings'
import 'conceptpicker/ConceptPicker'
import '../css/builder.css'
import 'ko.sortable'
import './CohortExpressionEditor.less'

function CohortExpressionEditorViewModel (params) {
  const self = this
  this.expressionMode = ko.observable('all')
  self.helpCohortEventsOpened = ko.observable(false)
  self.helpInclusionCriteriaOpened = ko.observable(false)
  self.helpCohortExitOpened = ko.observable(false)

  if (params.widget) {
    params.widget(this)
  }

  self.expression = params.expression
  self.options = options

  self.showCensorWindow = ko.observable(
    self.expression().CensorWindow().StartDate() ||
      self.expression().CensorWindow().EndDate()
  )
  self.selectedInclusionRule = ko.observable(null)
  self.selectedInclusionRuleIndex = null

  self.selectInclusionRule = function (inclusionRule) {
    self.selectedInclusionRule(inclusionRule)
    self.selectedInclusionRuleIndex = params
      .expression()
      .InclusionRules()
      .indexOf(inclusionRule)
  }

  self.removeAdditionalCriteria = function () {
    self.expression().AdditionalCriteria(null)
  }

  self.addAdditionalCriteria = function () {
    self
      .expression()
      .AdditionalCriteria(
        new CriteriaGroup(null, self.expression().ConceptSets)
      )
  }

  self.addInclusionRule = function () {
    const newInclusionRule = new InclusionRule(
      null,
      self.expression().ConceptSets
    )
    self.expression().InclusionRules.push(newInclusionRule)
    self.selectInclusionRule(newInclusionRule)
  }

  self.deleteInclusionRule = function (inclusionRule) {
    self.selectedInclusionRule(null)
    self.expression().InclusionRules.remove(inclusionRule)
  }

  self.copyInclusionRule = function (inclusionRule) {
    const copiedRule = new InclusionRule(
      ko.toJS(inclusionRule),
      self.expression().ConceptSets
    )
    const name = copiedRule.name() || ko.unwrap(ko.i18n('components.cohortExpressionEditor.unnamedCriteria', 'Unnamed Criteria'))
    copiedRule.name(ko.i18nformat('common.copyOf', 'Copy of <%=name%>', { name })())
    self.expression().InclusionRules.push(copiedRule)
    self.selectedInclusionRule(copiedRule)
  }

  self.getExpressionJSON = function () {
    return ko.toJSON(
      self.expression(),
      function (key, value) {
        if (value === 0 || value) {
          return value
        } else {

        }
      },
      2
    )
  }

  self.inclusionRuleNavMinHeight = function () {
    return (
      Math.max(
        75,
        Math.min(550, self.expression().InclusionRules().length * 40)
      ) + 'px'
    )
  }

  // Subscriptions

  self.expressionSubscription = self.expression.subscribe(function (newVal) {
    self.selectedInclusionRule(
      params.expression().InclusionRules()[self.selectedInclusionRuleIndex]
    )
  })

  // Cleanup

  self.dispose = function () {
    self.expressionSubscription.dispose()
  }
}

// return factory
export { CohortExpressionEditorViewModel, template }
export default { viewModel: CohortExpressionEditorViewModel, template }

