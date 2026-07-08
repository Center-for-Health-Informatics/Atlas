import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import Range from 'components/cohortbuilder/InputTypes/Range'
import Text from 'components/cohortbuilder/InputTypes/Text'
import template from './DrugExposureTemplate.html?raw'

function DrugExposureViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.DrugExposure
  self.options = options

  self.indexMessage = ko.i18nformat(
    'components.conditionDrugExposure.indexDataText',
    'The index date refers to the drug exposure of <%= conceptSetName %>.',
    {
      conceptSetName: ko.pureComputed(() => utils.getConceptSetName(
        self.Criteria.CodesetId,
        self.expression.ConceptSets,
        ko.i18n('components.conditionDrugExposure.anyDrug', 'Any Drug')
      ))
    }
  )
}

// return compoonent definition
export { DrugExposureViewModel, template }
export default { viewModel: DrugExposureViewModel, template }
