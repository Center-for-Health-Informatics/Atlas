import ko from 'knockout'

function dirtyFlag (root, isInitiallyDirty) {
  let origState = new Map()
  const changedObservablesCount = ko.observable()
  const changedCount = ko.observable()

  const getObjectObservables = function (obj, res, currentPath = '') {
    if (typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const path = `${currentPath}.${key}`.replace(/^\./, '')
          if (typeof obj[key] !== 'undefined' && obj[key] !== null && typeof obj[key].subscribe === 'function') {
            res[path] = obj[key].extend({ childChanges: true })
          }
          const variable = ko.utils.unwrapObservable(obj[key])
          if (typeof variable === 'object') {
            getObjectObservables(variable, res, path)
          }
        }
      }
    }
    return res
  }

  const addObservablesToState = function (state, observables) {
    for (const i in observables) {
      (function (key) {
        const subscription = observables[key].subscribe(newVal => {
          changedCount(changedCount() + 1)
          const stateEntry = state.get(key)
          const isTypeChanged = ko.toJSON(newVal) === '""' && stateEntry.origVal === 'null'
          if (ko.toJSON(newVal) !== stateEntry.origVal && !isTypeChanged && !stateEntry.wasChanged) {
            stateEntry.wasChanged = true
            changedObservablesCount(changedObservablesCount() + 1)
            addObservablesToState(state, getObjectObservables(newVal, {}))
          } else if ((ko.toJSON(newVal) === stateEntry.origVal || isTypeChanged) && stateEntry.wasChanged) {
            stateEntry.wasChanged = false
            changedObservablesCount(changedObservablesCount() - 1)
          }
        })
        state.set(key, { subscription, wasChanged: false, origVal: ko.toJSON(observables[key]) })
      })(i)
    }
  }

  const setNewState = function (newState) {
    // clean up prev data
    origState.forEach(entry => entry.subscription.dispose())

    // setup new data
    const observables = getObjectObservables(newState, {})
    origState = new Map()
    addObservablesToState(origState, observables)
    changedObservablesCount(0)
    changedCount(0)
  }

  const result = function () {}
  const _isInitiallyDirty = ko.observable(isInitiallyDirty)

  setNewState(root)

  result.isDirty = ko.pureComputed(function () {
    return _isInitiallyDirty() || changedObservablesCount()
  }).extend({
    rateLimit: 200
  })

  result.isChanged = ko.pureComputed(function () {
    return changedCount()
  }).extend({
    rateLimit: {
      timeout: 1000,
      method: 'notifyWhenChangesStop'
    }
  })

  result.reset = function () {
    _isInitiallyDirty(false)
    setNewState(root)
  }

  return result
}

export default dirtyFlag
