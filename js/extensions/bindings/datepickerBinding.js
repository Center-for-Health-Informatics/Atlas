import $ from 'jquery'
import ko from 'knockout'
import 'jquery-ui/ui/keycode'
import 'jquery-ui/ui/widgets/datepicker'

ko.bindingHandlers.datepicker = {
  init: function (element, valueAccessor, allBindingsAccessor) {
    // initialize datepicker with some optional options
    const options = allBindingsAccessor().datepickerOptions || {}
    $(element).datepicker(options)

    // handle the field changing
    ko.utils.registerEventHandler(element, 'change', function () {
      const observable = valueAccessor()
      observable($(element).datepicker('getDate'))
    })

    // handle disposal (if KO removes by the template binding)
    ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
      $(element).datepicker('destroy')
    })
  },
  update: function (element, valueAccessor) {
    let value = ko.utils.unwrapObservable(valueAccessor())

    // handle date data coming via json from Microsoft
    if (typeof value === 'string') {
      if (String(value).indexOf('/Date(') == 0) {
        value = new Date(parseInt(value.replace(/\/Date\((.*?)\)\//gi, '$1')))
      } else { value = new Date(value) }

      // offset this timezone to UTC
      const localOffset = value.getTimezoneOffset() * 60000
      value = new Date(value.getTime() + localOffset)
    }

    const current = $(element).datepicker('getDate')

    if (value - current !== 0) {
      $(element).datepicker('setDate', value)
    }
  }
}
