import ko from 'knockout'
import view from './multi-select.html?raw'
import './multi-select.less'

function multiSelectFilter (params) {
  const self = this

  self.multiple = params.multiple
  self.options = params.options
  self.disable = (params.disable || false)
  self.selectedValues = ko.observableArray(params.selectedValues && params.selectedValues())
  self.selectedValue = params.selectedValue

  self.optionVals = ko.computed(() => {
    return params.options().map(opt => opt.value)
  })

  self.optionsText = (val) => params.options().find(opt => opt.value === val).label

  self.selectSize = ko.pureComputed(() => Math.min(Math.max(self.optionVals().length, 2), 6))

  if (params.multiple) {
    self.selectedValues.subscribe(newValues => {
      params.selectedValues(newValues)
    })
  }
}

const component = {
  viewModel: multiSelectFilter,
  template: view
}

ko.components.register('multi-select', component)

export default component
