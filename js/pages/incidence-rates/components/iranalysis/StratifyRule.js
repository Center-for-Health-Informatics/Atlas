import ko from 'knockout'
import CriteriaGroup from 'components/cohortbuilder/CriteriaGroup'

function StrataRule (data, conceptSets) {
  const self = this
  var data = data || {}

  self.name = ko.observable(data.name || null)
  self.description = ko.observable(data.description || null)
  self.expression = new CriteriaGroup(data.expression, conceptSets)
}

export default StrataRule

