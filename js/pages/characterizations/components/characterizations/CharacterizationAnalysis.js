import ko from 'knockout'
import constants from 'const'
import ConceptSet from 'components/conceptset/InputTypes/ConceptSet'
import CriteriaGroup from 'components/cohortbuilder/CriteriaGroup'

class CharacterizationAnalysis {
  constructor (design) {
    const data = design || {}

    Object.assign(this, data)
    this.defaultName = ko.unwrap(constants.newEntityNames.characterization)
    this.name = ko.observable(data.name || this.defaultName)
    this.cohorts = ko.observableArray(data.cohorts)
    this.featureAnalyses = ko.observableArray(data.featureAnalyses || [])
    data.featureAnalyses && data.featureAnalyses.forEach(fa => {
      fa['includeAnnual'] = ko.observable(fa.includeAnnual)
      fa['includeTemporal'] = ko.observable(fa.includeTemporal)
    })
    this.parameters = ko.observableArray(data.parameters)
    this.strataConceptSets = ko.observableArray((data.strataConceptSets && data.strataConceptSets.map(cs => new ConceptSet(cs))) || [])
    this.strataOnly = ko.observable(data.strataOnly)
    this.stratas = ko.observableArray((data.stratas && data.stratas.map(s => ({
      id: ko.observable(s.id),
      name: ko.observable(s.name),
      criteria: ko.observable(new CriteriaGroup(s.criteria, this.strataConceptSets)),
    }))) || [])
    this.tags = ko.observableArray(data.tags)
    this.description = ko.observable(data.description || null)
  }
}

export default CharacterizationAnalysis

