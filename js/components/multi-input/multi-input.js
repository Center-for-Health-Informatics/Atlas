import ko from 'knockout'
import view from './multi-input.html?raw'
import commonUtils from 'utils/CommonUtils'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import IntegerTypeValidator from './types/IntegerTypeValidator'
import FloatTypeValidator from './types/FloatTypeValidator'
import { isEqual, sortBy } from 'utils/NativeCompat'
import 'databindings'
import './multi-input.less'

const typeValidators = {
  integer: new IntegerTypeValidator(),
  float: new FloatTypeValidator()
}

class MultiInput extends AutoBind(Component) {
  constructor (params) {
    super(params)

    this.typeValidator = typeValidators[params.selectedValueType]
    this.selectedValues = params.selectedValues
    this.itemToAdd = ko.observable('').extend(this.typeValidator.extender)
    this.defaultValues = params.defaultValues
    this.valueLabel = params.valueLabel || 'Value'

    this.hasSelectedValues = ko.pureComputed(() => {
      return (this.selectedValues && this.selectedValues().length > 0)
    })
    this.hasDefaults = ko.pureComputed(() => {
      return (this.defaultValues && this.defaultValues.length > 0)
    })
    this.enableAdd = ko.pureComputed(() => {
      return (this.itemToAdd() !== null && this.itemToAdd().toString().length > 0 && this.typeValidator.checkValue(this.typeValidator.parseType(this.itemToAdd())))
    })
    this.enableDefaults = ko.pureComputed(() => {
      return (this.selectedValues && this.hasDefaults() && !(isEqual(sortBy(this.selectedValues()), sortBy(this.defaultValues))))
    })
    this.defaultText = ko.pureComputed(() => {
      return this.enableDefaults()
        ? ko.i18n('predictions.resetToDefault', 'Reset to default')
        : ko.i18n('predictions.usingDefault', 'Using Default')
    })
  }

  addItem () {
    if (this.itemToAdd() != null) {
      this.selectedValues.push(this.typeValidator.parseType(this.itemToAdd()))
      this.itemToAdd(null)
    }
  }

  deleteItem (data, event) {
    const index = this.selectedValues.indexOf(data)
    this.selectedValues.splice(index, 1)
  }

  setToDefaults () {
    const defaultValues = this.defaultValues.slice()
    this.selectedValues(defaultValues)
  }

  enterPressed (data, context, event) {
    const keyCode = (event.which ? event.which : event.keyCode)
    if (keyCode === 13 && this.enableAdd()) {
      this.addItem()
    }
  }
}

export default commonUtils.build('multi-input', MultiInput, view)
