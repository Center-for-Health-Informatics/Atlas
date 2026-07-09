import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { formatNumeral } from '../../js/utils/NumberFormatUtils.js'

describe('NumberFormatUtils', () => {
  test('formatNumeral defaults to grouped integer formatting', () => {
    assert.strictEqual(formatNumeral(1234.567), '1,235')
    assert.strictEqual(formatNumeral(0), '0')
    assert.strictEqual(formatNumeral(-1234.567), '-1,235')
  })

  test('formatNumeral honors decimal-place count and grouping in the format string', () => {
    assert.strictEqual(formatNumeral(1234.567, '0,0.0000'), '1,234.5670')
    assert.strictEqual(formatNumeral(1234.567, '0.00'), '1234.57')
    assert.strictEqual(formatNumeral(1234.567, '0,0.00'), '1,234.57')
  })

  test('formatNumeral rounds the same way numeral does, including half-up decimals', () => {
    assert.strictEqual(formatNumeral(1.005, '0.00'), '1.01')
    assert.strictEqual(formatNumeral(2.675, '0.00'), '2.68')
  })

  test('formatNumeral treats null/undefined/empty string as zero', () => {
    assert.strictEqual(formatNumeral(null), '0')
    assert.strictEqual(formatNumeral(undefined), '0')
    assert.strictEqual(formatNumeral(''), '0')
  })

  test('formatNumeral treats NaN as zero and +/-Infinity as "NaN", matching numeral', () => {
    assert.strictEqual(formatNumeral(NaN), '0')
    assert.strictEqual(formatNumeral(Infinity), 'NaN')
    assert.strictEqual(formatNumeral(-Infinity), 'NaN')
  })

  test('formatNumeral never renders a negative sign on a value that rounds to zero', () => {
    assert.strictEqual(formatNumeral(-0.001, '0.00'), '0.00')
    assert.strictEqual(formatNumeral(-0.001), '0')
  })
})
