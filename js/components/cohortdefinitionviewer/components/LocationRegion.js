import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import Range from 'components/cohortbuilder/InputTypes/Range'
import template from './LocationRegionTemplate.html?raw'

function LocationRegionViewModel (params) {
  const self = this
  self.expression = ko.utils.unwrapObservable(params.expression)
  self.Criteria = params.criteria.LocationRegion
  self.options = options

  self.getCodesetName = function (codesetId, defaultName) {
    if (codesetId != null) {
      const selectedConceptSet = self.expression.ConceptSets().filter(function (item) { return item.id == codesetId })[0]
      return ko.utils.unwrapObservable(selectedConceptSet.name)
    } else { return defaultName }
  }
}

// return compoonent definition
export { template }
export default { template }

