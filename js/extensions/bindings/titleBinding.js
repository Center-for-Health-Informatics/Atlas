import ko from 'knockout'

ko.bindingHandlers.title = {
  init: function (element, valueAccessor) {
    ko.applyBindingsToNode(element, { attr: { title: valueAccessor() } })
  }
}
