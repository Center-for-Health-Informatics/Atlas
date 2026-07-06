import ko from 'knockout'
import constants from 'const'
import ReusableParameter from '../pages/reusables/ReusableParameter'
import ConceptSet from 'components/conceptset/InputTypes/ConceptSet'
import CriteriaGroup from 'components/cohortbuilder/CriteriaGroup'
import PrimaryCriteria from 'components/cohortbuilder/PrimaryCriteria'
import * as CriteriaTypes from 'components/cohortbuilder/CriteriaTypes'

class Reusable {
  constructor (d) {
    const data = d || {}
    Object.assign(this, data)
    this.name = ko.observable(data.name || ko.unwrap(constants.newEntityNames.reusable))
    this.description = ko.observable(data.description || null)
    this.data = data.data ? JSON.parse(data.data) : {}
    this.type = ko.observable(this.data.type || 'CRITERIA_GROUP')
    this.parameters = ko.observableArray(this.data.parameters && this.data.parameters.map((p) => new ReusableParameter(p)))
    this.conceptSets = ko.observableArray(this.data.conceptSets && this.data.conceptSets.map((d) => new ConceptSet(d)))

    // default type
    this.criteriaGroupExpression = new CriteriaGroup(this.data.criteriaGroupExpression ? this.data.criteriaGroupExpression : this.data.expression,
      this.conceptSets)

    this.initialEventExpression = new PrimaryCriteria(this.data.initialEventExpression, this.conceptSets)

    this.censoringEventExpression = ko.observableArray(this.data.censoringEventExpression && this.data.censoringEventExpression.map(criteria =>
      CriteriaTypes.GetCriteriaFromObject(criteria, this.conceptSets)
    ))

    this.tags = ko.observableArray(data.tags)
  }
}

export default Reusable

