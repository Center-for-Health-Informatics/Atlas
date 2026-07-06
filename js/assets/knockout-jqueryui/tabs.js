import ko from 'knockout'
import BindingHandler from './bindingHandler'
import { uiVersion, createObject, register } from './utils'
import 'jquery-ui/ui/widgets/tabs'

function postInitHandler18 (element, valueAccessor) {
  const value = valueAccessor()
  if (ko.isWriteableObservable(value.selected)) {
    this.on(element, 'show', function (ev, ui) {
      if ($(element)[0] === ev.target) {
        value.selected(ui.index)
      }
    })
  }
}

function postInitHandler (element, valueAccessor) {
  const value = valueAccessor()
  if (ko.isWriteableObservable(value.active)) {
    this.on(element, 'activate', function (ev, ui) {
      if ($(element)[0] === ev.target) {
        value.active(ui.newTab.index())
      }
    })
  }
}

function Tabs () {
  BindingHandler.call(this, 'tabs')
  this.version = uiVersion

  if (uiVersion && uiVersion.major === 1 && uiVersion.minor === 8) {
    this.options = ['ajaxOptions', 'cache', 'collapsible', 'cookie',
      'disabled', 'event', 'fx', 'idPrefix', 'panelTemplate', 'selected',
      'spinner', 'tabTemplate']
    this.events = ['add', 'create', 'disable', 'enable', 'load', 'remove',
      'select', 'show']
    this.hasRefresh = false
  } else {
    this.options = ['active', 'collapsible', 'disabled', 'event',
      'heightStyle', 'hide', 'show']
    this.events = ['activate', 'beforeActivate', 'beforeLoad', 'create', 'load']
    this.hasRefresh = true
  }
}

Tabs.prototype = createObject(BindingHandler.prototype)
Tabs.prototype.constructor = Tabs

Tabs.prototype.init = function (element, valueAccessor) {
  BindingHandler.prototype.init.apply(this, arguments)

  if (this.version && this.version.major === 1 && this.version.minor === 8) {
    postInitHandler18.call(this, element, valueAccessor)
  } else {
    postInitHandler.call(this, element, valueAccessor)
  }

  return { controlsDescendantBindings: true }
}

register(Tabs)

export default Tabs
