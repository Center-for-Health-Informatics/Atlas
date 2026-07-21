import ko from 'knockout'
import { Tooltip } from 'bootstrap'

ko.bindingHandlers.tooltip = {
  init: function (element, valueAccessor) {
    const value = ko.utils.unwrapObservable(valueAccessor())
    if (value) {
      const tooltip = new Tooltip(element, {
        html: true,
        container: 'body',
        title: value
      })
      ko.utils.domNodeDisposal.addDisposeCallback(element, () => tooltip.dispose())
    }
  },
  update: function (element, valueAccessor) {
    const value = ko.utils.unwrapObservable(valueAccessor())
    let tooltip = Tooltip.getInstance(element)
    if (value) {
      if (tooltip) {
        tooltip.setContent({ '.tooltip-inner': value })
      } else {
        tooltip = new Tooltip(element, {
          html: true,
          container: 'body',
          title: value
        })
        ko.utils.domNodeDisposal.addDisposeCallback(element, () => tooltip.dispose())
      }
    } else if (tooltip) {
      tooltip.dispose()
    }
  }
}
