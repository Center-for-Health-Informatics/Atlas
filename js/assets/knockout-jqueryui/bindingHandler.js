import $ from 'jquery'
import ko from 'knockout'

const domDataKey = '__kojqui_options'

function filterAndUnwrapProperties (source, properties) {
  const result = {}
  ko.utils.arrayForEach(properties, function (property) {
    if (source[property] !== undefined) {
      result[property] = ko.utils.unwrapObservable(source[property])
    }
  })
  return result
}

function subscribeToRefreshOn (widgetName, element, bindingValue) {
  if (ko.isObservable(bindingValue.refreshOn)) {
    ko.computed({
      read: function () {
        bindingValue.refreshOn()
        $(element)[widgetName]('refresh')
      },
      disposeWhenNodeIsRemoved: element
    })
  }
}

function BindingHandler (widgetName) {
  this.widgetName = widgetName
  this.widgetEventPrefix = widgetName
  this.options = []
  this.events = []
  this.hasRefresh = false
}

BindingHandler.prototype.init = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
  const widgetName = this.widgetName
  const value = valueAccessor()
  const unwrappedOptions = filterAndUnwrapProperties(value, this.options)
  const unwrappedEvents = filterAndUnwrapProperties(value, this.events)

  ko.applyBindingsToDescendants(bindingContext, element)
  ko.utils.domData.set(element, domDataKey, unwrappedOptions)

  $.each(unwrappedEvents, function (key, val) {
    unwrappedEvents[key] = val.bind(viewModel)
  })

  $(element)[widgetName](ko.utils.extend(unwrappedOptions, unwrappedEvents))

  if (this.hasRefresh) {
    subscribeToRefreshOn(widgetName, element, value)
  }

  if (ko.isWriteableObservable(value.widget)) {
    value.widget($(element))
  }

  ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
    $(element)[widgetName]('destroy')
  })

  return { controlsDescendantBindings: true }
}

BindingHandler.prototype.update = function (element, valueAccessor) {
  const widgetName = this.widgetName
  const value = valueAccessor()
  const oldOptions = ko.utils.domData.get(element, domDataKey)
  const newOptions = filterAndUnwrapProperties(value, this.options)

  $.each(newOptions, function (prop, val) {
    if (val !== oldOptions[prop]) {
      $(element)[widgetName]('option', prop, newOptions[prop])
    }
  })

  ko.utils.domData.set(element, domDataKey, newOptions)
}

BindingHandler.prototype.on = function (element, type, callback) {
  let eventName
  if (type === this.widgetEventPrefix) {
    eventName = type
  } else {
    eventName = this.widgetEventPrefix + type
  }
  eventName = [eventName.toLowerCase(), '.', this.widgetName].join('')

  $(element).on(eventName, callback)

  ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
    $(element).off(eventName)
  })
}

export default BindingHandler
