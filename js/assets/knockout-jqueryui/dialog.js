import $ from 'jquery'
import ko from 'knockout'
import BindingHandler from './bindingHandler'
import { uiVersion, createObject, register } from './utils'
import 'jquery-ui/ui/widgets/dialog'

function Dialog () {
  BindingHandler.call(this, 'dialog')

  if (uiVersion && uiVersion.major === 1 && uiVersion.minor === 8) {
    this.options = ['autoOpen', 'buttons', 'closeOnEscape', 'closeText',
      'dialogClass', 'disabled', 'draggable', 'height', 'maxHeight',
      'maxWidth', 'minHeight', 'minWidth', 'modal', 'position', 'resizable',
      'show', 'stack', 'title', 'width', 'zIndex']
    this.events = ['beforeClose', 'create', 'open', 'focus', 'dragStart',
      'drag', 'dragStop', 'resizeStart', 'resize', 'resizeStop', 'close']
  } else if (uiVersion && uiVersion.major === 1 && uiVersion.minor === 9) {
    this.options = ['autoOpen', 'buttons', 'closeOnEscape', 'closeText',
      'dialogClass', 'draggable', 'height', 'hide', 'maxHeight', 'maxWidth',
      'minHeight', 'minWidth', 'modal', 'position', 'resizable', 'show',
      'stack', 'title', 'width', 'zIndex']
    this.events = ['beforeClose', 'create', 'open', 'focus', 'dragStart',
      'drag', 'dragStop', 'resizeStart', 'resize', 'resizeStop', 'close']
  } else {
    this.options = ['appendTo', 'autoOpen', 'buttons', 'closeOnEscape',
      'closeText', 'dialogClass', 'draggable', 'height', 'hide',
      'maxHeight', 'maxWidth', 'minHeight', 'minWidth', 'modal', 'position',
      'resizable', 'show', 'title', 'width']
    this.events = ['beforeClose', 'create', 'open', 'focus', 'dragStart',
      'drag', 'dragStop', 'resizeStart', 'resize', 'resizeStop', 'close']
  }
}

Dialog.prototype = createObject(BindingHandler.prototype)
Dialog.prototype.constructor = Dialog

Dialog.prototype.init = function (element, valueAccessor) {
  const marker = document.createElement('DIV')
  marker.style.display = 'none'
  element.parentNode.insertBefore(marker, element)

  ko.utils.domNodeDisposal.addDisposeCallback(marker, function () {
    ko.removeNode(element)
  })

  BindingHandler.prototype.init.apply(this, arguments)

  const value = valueAccessor()

  if (value.isOpen) {
    ko.computed({
      read: function () {
        if (ko.utils.unwrapObservable(value.isOpen)) {
          $(element)[this.widgetName]('open')
        } else {
          $(element)[this.widgetName]('close')
        }
      },
      disposeWhenNodeIsRemoved: element,
      owner: this
    })
  }
  if (ko.isWriteableObservable(value.isOpen)) {
    this.on(element, 'open', function () { value.isOpen(true) })
    this.on(element, 'close', function () { value.isOpen(false) })
  }

  if (ko.isWriteableObservable(value.width)) {
    this.on(element, 'resizestop', function (ev, ui) {
      value.width(Math.round(ui.size.width))
    })
  }

  if (ko.isWriteableObservable(value.height)) {
    this.on(element, 'resizestop', function (ev, ui) {
      value.height(Math.round(ui.size.height))
    })
  }

  return { controlsDescendantBindings: true }
}

register(Dialog)

export default Dialog
