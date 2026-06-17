import ko from 'knockout'

ko.bindingHandlers.contenteditableSwitch = {
  init: function (element, valueAccessor) {
    ko.applyBindingsToNode(element, {
      attr: {
        contenteditable: valueAccessor()
      }
    })
  }
}
