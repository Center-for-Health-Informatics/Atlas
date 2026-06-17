import ko from 'knockout'
import view from './comparison-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import Cohort from 'services/analysis/Cohort'
import ConceptSet from 'services/analysis/ConceptSet'
import 'components/entityBrowsers/cohort-definition-browser'
import 'components/cohort/linked-cohort-list'
import 'circe'

class ComparisonEditor extends Component {
  constructor (params) {
    super(params)

    this.comparison = params.comparison
    this.isEditPermitted = params.isEditPermitted
    this.currentCohort = ko.observable(null)
    this.showCohortSelector = ko.observable(false)
    this.showConceptSetSelector = ko.observable(false)
    this.currentConceptSet = ko.observable(null)
  }

  cohortSelected (id, name) {
    this.currentCohort()(new Cohort({ id, name }))
    this.showCohortSelector(false)
  }

  chooseTarget () {
    this.showCohortSelector(true)
    this.currentCohort(this.comparison.target)
  }

  chooseComparator () {
    this.showCohortSelector(true)
    this.currentCohort(this.comparison.comparator)
  }

  clearTarget () {
    this.comparison.target(new Cohort())
  }

  clearComparator () {
    this.comparison.comparator(new Cohort())
  }

  chooseNegativeControlOutcomesConceptSet () {
    this.currentConceptSet(this.comparison.negativeControlOutcomesConceptSet)
    this.showConceptSetSelector(true)
  }

  clearNegativeControlOutcomesConceptSet () {
    this.comparison.negativeControlOutcomesConceptSet(new ConceptSet())
  }

  chooseIncludedCovariateConceptSet () {
    this.currentConceptSet(this.comparison.includedCovariateConceptSet)
    this.showConceptSetSelector(true)
  }

  clearIncludedCovariateConceptSet () {
    this.comparison.includedCovariateConceptSet(new ConceptSet())
  }

  chooseExcludedCovariateConceptSet () {
    this.currentConceptSet(this.comparison.excludedCovariateConceptSet)
    this.showConceptSetSelector(true)
  }

  clearExcludedCovariateConceptSet () {
    this.comparison.excludedCovariateConceptSet(new ConceptSet())
  }

  conceptsetSelected (d) {
    this.currentConceptSet()(new ConceptSet({ id: d.id, name: d.name }))
    this.showConceptSetSelector(false)
  }
}

export default commonUtils.build('comparison-editor', ComparisonEditor, view)

