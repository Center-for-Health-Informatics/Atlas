import ko from 'knockout'

ko.bindingHandlers.placeholder = {
  init: function (element, valueAccessor) {
    ko.applyBindingsToNode(element, { attr: { placeholder: valueAccessor() } })
  }
}
