import ko from 'knockout'
import { Modal } from 'bootstrap'

ko.bindingHandlers.modal = {
  init: function (element, valueAccessor) {
    const modal = Modal.getOrCreateInstance(element, { show: false })

    const value = valueAccessor()
    if (ko.isObservable(value)) {
      // Use "hidden.bs.modal" (rather than "hide.bs.modal") to avoid
      // running modal.hide() twice.
      element.addEventListener('hidden.bs.modal', function () {
        value(false)
      })
    }

    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
      modal.dispose()
    })
  },
  update: function (element, valueAccessor) {
    const value = valueAccessor()
    const modal = Modal.getOrCreateInstance(element)
    if (ko.utils.unwrapObservable(value)) {
      modal.show()
    } else {
      modal.hide()
    }
  }
}
