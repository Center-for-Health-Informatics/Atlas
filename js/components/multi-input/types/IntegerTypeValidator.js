import TypeValidator from './TypeValidator'

class IntegerTypeValidator extends TypeValidator {
  constructor () {
    super({ type: 'integer', extender: { numeric: 0 } })
  }

  checkValue (val) {
    return !isNaN(val)
  }

  parseType (item) {
    return parseInt(item)
  }
}

export default IntegerTypeValidator

