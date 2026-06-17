import ko from 'knockout'
import view from './atlas.cohort-editor.html?raw'
import config from 'appConfig'
import sharedState from 'atlas-state'
import commonUtils from 'utils/CommonUtils'
import CohortDefinition from 'components/cohortbuilder/CohortDefinition'
import ConceptSet from 'components/conceptset/InputTypes/ConceptSet'
import conceptSetUtils from 'components/conceptset/utils'
import 'components/cohortbuilder/components'
import 'assets/knockout-jqueryui/tabs'
import 'cohortdefinitionviewer'
import 'circe'
import 'databindings'

function cohortEditor (params) {
  const self = this
  self.criteriaContext = ko.observable(null)
  self.canEdit = params.canEditCurrentCohortDefinition
  self.loadConceptSet = params.loadConceptSet
  self.currentCohortDefinition = sharedState.CohortDefinition.current
  self.currentCohortDefinitionMode = sharedState.CohortDefinition.mode
  self.tabMode = ko.observable('expression')
  self.tabWidget = ko.observable()
  self.cohortExpressionEditor = ko.observable()
  self.showModal = ko.observable(false)
  self.tableOptions = params.tableOptions || commonUtils.getTableOptions('M')
  // model behaviors

  self.handleConceptSetImport = function (item, context, event) {
    self.criteriaContext(item)
    self.showModal(true)
    return false
  }

  self.handleEditConceptSet = function (item, context) {
    if (item.conceptSetId() == null) {
      return
    }

    self.loadConceptSet(item.conceptSetId())
    self.currentCohortDefinitionMode('conceptsets')
  }

  self.onAtlasConceptSetSelectAction = function (result) {
    self.showModal(false)

    if (result.action === 'add') {
      const cohortConceptSets = self.currentCohortDefinition().expression().ConceptSets
      const newId = conceptSetUtils.newConceptSetHandler(cohortConceptSets, self.criteriaContext())
      self.loadConceptSet(newId)
    }

    self.criteriaContext(null)
  }

  self.onGenerate = function (generateComponent) {
    CohortDefinition.generate(self.currentCohortDefinition().id(), generateComponent.source.sourceKey, false)
      .then(function (result) {
        pollForInfo()
      })
  }

  self.getExpressionJSON = function () {
    return ko.toJSON(self.currentCohortDefinition().Expression, pruneJSON, 2)
  }
}

const component = {
  viewModel: cohortEditor,
  template: view
}

ko.components.register('atlas.cohort-editor', component)
export default component

