import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import exceptionUtils from '../../js/utils/ExceptionUtils.js'

describe('ExceptionUtils', () => {
  test('translates 403 errors into a permission message', () => {
    assert.strictEqual(exceptionUtils.translateException({ status: 403 }), 'You have insufficient permissions!')
  })

  test('translates other errors into a generic message', () => {
    assert.strictEqual(exceptionUtils.translateException({ status: 500 }), 'Oops, Something went wrong!')
  })

  test('extracts messages from server payloads', () => {
    const payload = { data: { payload: { message: 'Something broke' } } }
    assert.strictEqual(exceptionUtils.extractServerMessage(payload), 'Something broke')
  })

  test('falls back to default server message when payload missing', () => {
    assert.strictEqual(exceptionUtils.extractServerMessage({}), 'Error! Please see server logs for details.')
  })
})
