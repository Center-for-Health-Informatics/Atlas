define([
  'knockout',
  'text!./InclusionRuleEditorTemplate.html',
  'components/cohortbuilder/components/CriteriaGroup',
  'ko.sortable',
], function (ko, template) {
  function InclusionRuleEditor (params) {
    const self = this
    self.InclusionRule = params.InclusionRule
    self.IndexRule = params.IndexRule
  }

  const component = {
    viewModel: InclusionRuleEditor,
    template,
  }

  // return component definition
  return component
})
