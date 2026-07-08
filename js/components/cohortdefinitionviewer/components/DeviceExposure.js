import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import template from './DeviceExposureTemplate.html?raw'

function DeviceExposureViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.DeviceExposure
  self.options = options

  self.indexMessage = ko.i18nformat(
    'components.conditionDevice.indexDataText',
    'The index date refers to the device exposure of <%= conceptSetName %>.',
    {
      conceptSetName: ko.pureComputed(() => utils.getConceptSetName(
        self.Criteria.CodesetId,
        self.expression.ConceptSets,
        ko.i18n('components.conditionDevice.anyDevice', 'Any Device')
      ))
    }
  )
}

// return compoonent definition
export { DeviceExposureViewModel, template }
export default { viewModel: DeviceExposureViewModel, template }

