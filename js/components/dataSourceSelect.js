import ko from 'knockout'
import view from './dataSourceSelect.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import sharedState from 'atlas-state'
import authApi from 'services/AuthAPI'
import vocabularyProvider from 'services/Vocabulary'
import constants from 'components/conceptset/const'

class DataSourceSelect extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.tab = params.tab
    this.conceptSetStore = params.conceptSetStore
    this.includedConcepts = this.conceptSetStore.includedConcepts
    this.includedSourcecodes = this.conceptSetStore.includedSourcecodes
    this.recommendedConcepts = this.conceptSetStore.recommendedConcepts
    this.currentConceptSetTab = this.conceptSetStore.currentConseptSetTab
    if (this.tab) {
      this.subscriptions.push(this.currentConceptSetTab.subscribe((tab) => {
        // refresh counts if the source was changed in another tab
        if (this.tab === tab) {
          this.refreshRecordCounts()
        }
      }))
    }
    this.commonUtils = commonUtils
    this.loading = params.loading
    this.selectedSource = params.selectedSource || ko.observable()
    this.currentSourceId = this.selectedSource() && this.selectedSource().sourceId
    this.selectedSourceValue = ko.pureComputed(() => {
      return this.selectedSource() && this.selectedSource().sourceId
    })
    this.resultSources = ko.computed(() => {
      const resultSources = []
      sharedState.sources().forEach((source) => {
        if (source.hasResults && authApi.isPermittedAccessSource(source.sourceKey)) {
          resultSources.push(source)
          if (source.resultsUrl === sharedState.resultsUrl() && !this.selectedSource()) {
            this.selectedSource(source)
            this.currentSourceId = source.sourceId
          }
        }
      })
      return resultSources
    })

    this.recordCountsRefreshing = ko.observable(false)
    this.recordCountClass = ko.pureComputed(() => {
      return this.recordCountsRefreshing() ? 'fa fa-circle-notch fa-spin fa-lg' : 'fa fa-database fa-lg'
    })
  }

  refreshRecordCountsHandler (obj, event) {
    if (!event.originalEvent) {
      return
    }
    this.recordCountsRefreshing(true)
    const currentResultSource = this.resultSources().find(source => source.sourceId === event.target.value)
    this.selectedSource(currentResultSource)
    this.refreshRecordCounts()
  }

  async refreshRecordCounts () {
    if (this.selectedSource().sourceId === this.currentSourceId) {
      this.recordCountsRefreshing(false)
      return
    }

    const { ViewMode } = constants
    switch (this.currentConceptSetTab()) {
      case ViewMode.INCLUDED: {
        const resultsIncludedConcepts = this.includedConcepts()
        await vocabularyProvider.loadDensity(resultsIncludedConcepts, this.selectedSource().sourceKey)
        this.includedConcepts(resultsIncludedConcepts)
        break
      }
      case ViewMode.SOURCECODES: {
        const resultsIncludedSourcecodes = this.includedSourcecodes()
        await vocabularyProvider.loadDensity(resultsIncludedSourcecodes, this.selectedSource().sourceKey)
        this.includedSourcecodes(resultsIncludedSourcecodes)
        break
      }
      case ViewMode.RECOMMEND: {
        const resultsRecommendedConcepts = this.recommendedConcepts()
        await vocabularyProvider.loadDensity(resultsRecommendedConcepts, this.selectedSource().sourceKey)
        this.recommendedConcepts(resultsRecommendedConcepts)
        break
      }
    }

    this.currentSourceId = this.selectedSource().sourceId
    this.recordCountsRefreshing(false)
  }
}

export default commonUtils.build('datasource-select', DataSourceSelect, view)
