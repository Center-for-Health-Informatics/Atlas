import ko from 'knockout'

// Github repository: https://github.com/One-com/knockout-select-on-focus
// License: standard 3-clause BSD license https://raw.github.com/One-com/knockout-dragdrop/master/LICENCE

/**
 * This binding selects the text in a input field or a textarea when the
 * field get focused.
 *
 * Usage:
 *     <input type="text" data-bind="selectOnFocus: true">
 *     Selects all text when the element is focused.
 *
 *     <input type="text" data-bind="selectOnFocus: /^[^\.]+/">
 *     Selects all text before the first period when the element is focused.
 *
 *     <input type="text" data-bind="selectOnFocus: { pattern: /^[^\.]+/, onlySelectOnFirstFocus: true }">
 *     Only select the pattern on the first focus.
 */
;(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD anonymous module with hard-coded dependency on "knockout"
    define(['knockout'], factory)
  } else {
    // <script> tag: use the global `ko` and `jQuery`
    factory(ko)
  }
})(function (ko) {
  function getOptions (valueAccessor) {
    const options = ko.utils.unwrapObservable(valueAccessor())
    if (options instanceof RegExp) {
      return { pattern: options }
    } else {
      return options
    }
  }

  function selectText (field, start, end) {
    if (field.createTextRange) {
      const selRange = field.createTextRange()
      selRange.collapse(true)
      selRange.moveStart('character', start)
      selRange.moveEnd('character', end)
      selRange.select()
      field.focus()
    } else if (field.setSelectionRange) {
      field.focus()
      field.setSelectionRange(start, end)
    } else if (typeof field.selectionStart !== 'undefined') {
      field.selectionStart = start
      field.selectionEnd = end
      field.focus()
    }
  }

  ko.bindingHandlers.selectOnFocus = {
    init: function (element, valueAccessor) {
      let firstFocus = true
      const options = getOptions(valueAccessor)
      const events = ko.utils.unwrapObservable(options.events) || ['focus']
      const pattern = ko.utils.unwrapObservable(options.pattern)

      function selectContentAsync () {
        setTimeout(function () {
          const onlySelectOnFirstFocus = ko.utils.unwrapObservable(options.onlySelectOnFirstFocus)

          if (!onlySelectOnFirstFocus || firstFocus) {
            if (Object.prototype.toString.call(pattern) === '[object RegExp]') {
              const matchInfo = pattern.exec(element.value)
              if (matchInfo) {
                const startOffset = matchInfo.index
                const endOffset = matchInfo.index + matchInfo[0].length
                selectText(element, startOffset, endOffset)
              }
            } else {
              if (element.select) { element.select() } else if (document.createRange && window.getSelection) {
                const range = document.createRange()
                range.selectNodeContents(element)
                const sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
              }
            }
            firstFocus = false
          }
        }, 1)
      }

      if (document.activeElement === element) {
        selectContentAsync()
      }

      events.forEach(function (e) {
        ko.utils.registerEventHandler(element, e, function (e) {
          selectContentAsync()
        })
      })
    }
  }
})
