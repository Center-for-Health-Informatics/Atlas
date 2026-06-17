import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import utils from 'components/cohortbuilder/utils'
import template from './MeasurementTemplate.html?raw'

function MeasurementViewModel (params) {
  const self = this

  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.Measurement
  self.options = options

  self.indexMessage = ko.pureComputed(() => {
    const conceptSetName = utils.getConceptSetName(
      self.Criteria.CodesetId,
      self.expression.ConceptSets,
      ''
    )
    return `${conceptSetName}.`
  })
}

// return compoonent definition
export default {
  viewModel: MeasurementViewModel,
  template
}

