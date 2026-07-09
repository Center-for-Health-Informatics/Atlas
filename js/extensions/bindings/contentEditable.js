import ko from 'knockout'
import $ from 'jquery'

ko.bindingHandlers.contentEditable = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    element.contentEditable = true

    $(element).on('input', function () {
      if (ko.isWriteableObservable(valueAccessor())) {
        valueAccessor()(this.innerText)
      }
    })
  },
  update: function (element, valueAccessor) {
    const value = ko.unwrap(valueAccessor())

    if (!$(element).is(':focus')) {
      element.innerText = value
    }
  }
}
