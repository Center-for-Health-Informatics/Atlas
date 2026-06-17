import TypeValidator from './TypeValidator'

class FloatTypeValidator extends TypeValidator {
  constructor () {
    super({ type: 'float', extender: { numeric: 9 } })
  }

  checkValue (val) {
    return !isNaN(val)
  }

  parseType (item) {
    return parseFloat(item)
  }
}

export default FloatTypeValidator

