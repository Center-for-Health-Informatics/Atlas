import ko from 'knockout'

function pad (n) {
  return String(n).padStart(2, '0')
}

// Formats a Date into the value shape <input type="datetime-local"> expects.
function toLocalInputValue (date) {
  if (!date) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

ko.bindingHandlers.dateTimePicker = {
  init: function (element, valueAccessor) {
    ko.utils.registerEventHandler(element, 'change', function () {
      const value = valueAccessor()
      if (ko.isObservable(value)) {
        value(element.value ? new Date(element.value) : null)
      }
    })
  },
  update: function (element, valueAccessor) {
    let koDate = ko.utils.unwrapObservable(valueAccessor())

    // in case return from server datetime i am get in this form for example /Date(93989393)/ then fomat this
    koDate = (typeof (koDate) !== 'object') ? new Date(parseFloat(koDate)) : koDate

    element.value = toLocalInputValue(koDate)
  }
}
