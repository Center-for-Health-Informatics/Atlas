import $ from 'jquery'
import ko from 'knockout'

const match = ($.ui.version || '').match(/^(\d)\.(\d+)/)

const uiVersion = match
  ? { major: parseInt(match[1], 10), minor: parseInt(match[2], 10) }
  : null

const createObject = Object.create || function (prototype) {
  function Type () {}
  Type.prototype = prototype
  return new Type()
}

function register (Constructor) {
  const handler = new Constructor()
  ko.bindingHandlers[handler.widgetName] = {
    init: handler.init.bind(handler),
    update: handler.update.bind(handler)
  }
}

export { uiVersion, createObject, register }
export default { uiVersion, createObject, register }
