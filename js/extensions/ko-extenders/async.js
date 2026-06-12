/*
 * Credit to https://smellegantcode.wordpress.com/2012/12/10/asynchronous-computed-observables-in-knockout-js/
 */
define(['knockout'], function (ko) {
  ko.extenders.async = function (computedDeferred, initialValue) {
    const plainObservable = ko.observable(initialValue); let currentDeferred
    plainObservable.inProgress = ko.observable(false)

    ko.computed(function () {
      if (currentDeferred) {
        currentDeferred.reject()
        currentDeferred = null
      }

      const newDeferred = computedDeferred()
      if (newDeferred &&
                (typeof newDeferred.done === 'function')) {
        // It's a deferred
        plainObservable.inProgress(true)

        // Create our own wrapper so we can reject
        currentDeferred = $.Deferred().done(function (data) {
          plainObservable.inProgress(false)
          plainObservable(data)
        })
        newDeferred.done(currentDeferred.resolve)
      } else {
        // A real value, so just publish it immediately
        plainObservable(newDeferred)
      }
    })

    return plainObservable
  }
})
