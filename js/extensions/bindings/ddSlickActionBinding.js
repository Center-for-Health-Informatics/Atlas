import $ from 'jquery'
import ko from 'knockout'
import 'jqueryui/jquery.ddslick'

function ddSlickInit (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
  const options = valueAccessor() || {}
  ddSlickSubInit(element, viewModel, bindingContext, options)
  return {
    controlsDescendantBindings: true
  }
}

function ddSlickSubInit (element, viewModel, bindingContext, options) {
  const $element = $(element)

  if ($element.children().length === 0) {
    $('<div></div>').appendTo($element)
  }

  $($element.children()[0]).ddslick({
    width: options.width || 175,
    height: options.height,
    optionWidth: options.optionWidth || 400,
    data: options.actionOptions,
    selectText: options.selectText || 'Select Action...',
    onSelected: function (data) {
      options.onAction(data)
      const $element = $(element)

      if ($element.children().length === 0) {
        $('<div></div>').appendTo($element)
      }

      $($element.children()[0]).ddslick('destroy')
      ddSlickSubInit(element, viewModel, bindingContext, options)
    }
  })
}

ko.bindingHandlers.ddSlickAction = {
  init: ddSlickInit
}
