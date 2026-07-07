import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import utils from '../../js/utils/DataTypeConverterUtils.js'

describe('DataTypeConverterUtils', () => {
  test('splits comma delimited values into arrays and numbers', () => {
    assert.deepStrictEqual(utils.commaDelimitedListToArray('A,B,C'), ['A', 'B', 'C'])
    assert.deepStrictEqual(utils.commaDelimitedListToArray(''), [])

    assert.deepStrictEqual(utils.commaDelimitedListToNumericArray('1,2,3'), [1, 2, 3])
  })

  test('converts comma delimited percents into normalized fractions', () => {
    assert.deepStrictEqual(utils.commaDelimitedListToPercentArray('50,1,0.25'), [0.5, 0.01, 0.25])
    assert.strictEqual(utils.percentArrayToCommaDelimitedList([0.5, 0.01, 2]), '50,1,2')
  })

  test('converts to and from YYYYMMDD R date format', () => {
    const date = new Date(2023, 4, 7) // Month is 0-based
    assert.strictEqual(utils.convertToDateForR(date), '20230507')

    const converted = utils.convertFromRDateToDate('20230507')
    assert.strictEqual(converted.getFullYear(), 2023)
    assert.strictEqual(converted.getMonth(), 4)
    assert.strictEqual(converted.getDate(), 7)
  })
})
