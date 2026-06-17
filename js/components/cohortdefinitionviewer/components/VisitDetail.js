import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import template from './VisitDetailTemplate.html?raw'

function VisitDetailViewModel (params) {
  const self = this
  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.VisitDetail
  self.options = options

  self.indexMessage = ko.i18nformat(
    'components.conditionVisitDetail.indexDataText',
    'The index date refers to the visit detail of <%= conceptSetName %>.',
    {
      conceptSetName: ko.pureComputed(() => utils.getConceptSetName(
        self.Criteria.CodesetId,
        self.expression.ConceptSets,
        ko.i18n('components.conditionVisitDetail.anyVisitDetail', 'Any Visit Detail')
      ))
    }
  )
}

// return component definition
export default {
  viewModel: VisitDetailViewModel,
  template,
}

