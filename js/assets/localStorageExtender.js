import ko from 'knockout'
import lscache from 'lscache'

if (typeof localStorage !== 'undefined') {
  ko.extenders.localStoragePersist = function (target, options) {
    var initialValue = target()
    var key = options[0]
    var expiration = options[1]

    if (key && lscache.get(key) !== null) {
      try {
        initialValue = lscache.get(key)
      } catch (e) {}
    }
    target(initialValue)

    target.subscribe(function (newValue) {
      lscache.set(key, newValue, expiration)
    })
    return target
  }
}
