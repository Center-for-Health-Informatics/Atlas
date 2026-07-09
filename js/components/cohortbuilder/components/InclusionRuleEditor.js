import template from './InclusionRuleEditorTemplate.html?raw'
import 'components/cohortbuilder/components/CriteriaGroup'
import 'ko.sortable'

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
export default component
