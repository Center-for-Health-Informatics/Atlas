import ko from 'knockout'
import view from './select-sources-btn.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import './select-sources-btn.less'
import 'components/modal-pick-options'
import './select-sources-popup'

class SelectSourcesBtn extends AutoBind(Component) {
  constructor (params) {
    super(params)

    this.label = typeof params.label === 'undefined' ? ko.i18n('components.generation.generate', 'Generate') : params.label
    this.wasGenerated = typeof params.wasGenerated === 'undefined' ? false : params.wasGenerated

    this.sources = params.sources || ko.observableArray()
    this.selectedSources = params.selectedSources || ko.observableArray()
    this.disabled = typeof params.disabled !== 'undefined' ? params.disabled : () => false
    this.disabledReason = params.disabledReason
    this.callback = params.callback

    this.shouldSuggestSelection = ko.computed(() => this.sources().length > 1)
    this.isPopupShown = ko.observable(false)
  }

  showPopup () {
    this.isPopupShown(true)
  }

  hidePopup () {
    this.isPopupShown(false)
  }

  generate () {
    let selectedSources = ko.utils.unwrapObservable(this.selectedSources)
    if (this.sources().length == 1) {
      selectedSources = this.sources()
    }

    if (selectedSources.length === 0) {
      alert(ko.i18n('components.generation.pickAtLeastOneSourceAlert', 'Pick at least one source to generate')())
    }
    this.callback(selectedSources)
    this.hidePopup()
  }
}

commonUtils.build('select-sources-btn', SelectSourcesBtn, view)
