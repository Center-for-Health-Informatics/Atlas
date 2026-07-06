import ko from 'knockout'
import lscache from 'lscache'

if (typeof localStorage !== 'undefined') {
  ko.extenders.localStoragePersist = function (target, options) {
    let initialValue = target()

    const key = options[0]
    const expiration = options[1]

    if (key && lscache.get(key) !== null) {
      try {
        initialValue = lscache.get(key)
      } catch (e) {
      }
    }
    target(initialValue)

    target.subscribe(function (newValue) {
      lscache.set(key, newValue, expiration)
    })
    return target
  }
}
