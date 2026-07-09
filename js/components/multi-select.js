import ko from 'knockout'
import view from './multi-select.html?raw'
import { xor } from 'utils/NativeCompat'
import './multi-select.less'
import 'extensions/bindings/multiSelect'
import 'databindings/eventListenerBinding'

function multiSelectFilter (params) {
  const self = this

  self.multiple = params.multiple
  self.options = params.options
  self.disable = (params.disable || false)
  self.selectedValues = ko.observableArray(params.selectedValues && params.selectedValues())
  self.selectedValue = params.selectedValue
  self.selectedTextFormat = params.selectedTextFormat || 'count > 2'
  self.noneSelectedText = ko.i18n('components.multiSelect.noneSelectedText', 'Nothing selected')
  self.noneResultsText = ko.i18n('components.multiSelect.noneResultsText', 'No matches found for {0}')
  self.countSelectedText = ko.i18n('components.multiSelect.countSelectedText', '{0} items selected')

  self.optionVals = ko.computed(() => {
    return params.options().map(opt => opt.value)
  })

  self.optionsText = (val) => params.options().find(opt => opt.value === val).label

  self.onSelectionComplete = function (data, context, event) {
    // only reset the param's selectedValues if the current selections are different
    if (params.multiple && xor(params.selectedValues(), self.selectedValues()).length !== 0) {
      params.selectedValues(self.selectedValues())
    }
  }
}

const component = {
  viewModel: multiSelectFilter,
  template: view
}

ko.components.register('multi-select', component)

export default component
