define(['knockout', 'jquery'], function (ko, $) {
  ko.bindingHandlers.contentEditable = {
    init: function (element, valueAccessor, allBindingsAccessor) {
      element.contentEditable = true
      const value = ko.unwrap(valueAccessor())

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
})
