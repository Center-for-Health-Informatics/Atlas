import $ from 'jquery'
import ko from 'knockout'
import 'jqueryui/autoGrowInput'

ko.bindingHandlers.autoGrowInput = {
  init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    const value = valueAccessor()
    const valueUnwrapped = ko.unwrap(value)
    if (valueUnwrapped === true) {
      // use default options
      $(element).autoGrowInput()
    } else if (valueUnwrapped === false) {
      // does nothing

    } else {
      // use custom options
      $(element).autoGrowInput(valueUnwrapped)
    }
  },
  update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    $(element).trigger('update')
  }
}
