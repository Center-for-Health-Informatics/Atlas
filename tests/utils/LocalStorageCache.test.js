import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

class FakeLocalStorage {
  constructor () {
    this.store = new Map()
  }

  getItem (key) {
    return this.store.has(key) ? this.store.get(key) : null
  }

  setItem (key, value) {
    this.store.set(key, String(value))
  }

  removeItem (key) {
    this.store.delete(key)
  }
}

globalThis.localStorage = new FakeLocalStorage()

const cache = await import('../../js/utils/LocalStorageCache.js')

describe('LocalStorageCache', () => {
  beforeEach(() => {
    globalThis.localStorage = new FakeLocalStorage()
  })

  test('get returns null for a missing key', () => {
    assert.strictEqual(cache.get('missing'), null)
  })

  test('set/get round-trips objects and primitives', () => {
    cache.set('obj', { a: 1, b: [2, 3] })
    assert.deepStrictEqual(cache.get('obj'), { a: 1, b: [2, 3] })

    cache.set('str', 'hello')
    assert.strictEqual(cache.get('str'), 'hello')
  })

  test('an item with no expiration never expires', () => {
    cache.set('forever', 'value')
    assert.strictEqual(cache.get('forever'), 'value')
  })

  test('an item past its expiration returns null and is removed', () => {
    const realNow = Date.now
    Date.now = () => 1_000_000
    cache.set('short-lived', 'value', 1) // 1 minute
    Date.now = () => 1_000_000 + 61 * 1000 // 61 seconds later
    assert.strictEqual(cache.get('short-lived'), null)
    Date.now = realNow

    // Confirm it was actually evicted, not just reported expired.
    assert.strictEqual(globalThis.localStorage.getItem('short-lived'), null)
  })

  test('an item within its expiration window is still returned', () => {
    const realNow = Date.now
    Date.now = () => 1_000_000
    cache.set('fresh', 'value', 5) // 5 minutes
    Date.now = () => 1_000_000 + 60 * 1000 // 1 minute later
    assert.strictEqual(cache.get('fresh'), 'value')
    Date.now = realNow
  })

  test('remove deletes a key', () => {
    cache.set('key', 'value')
    cache.remove('key')
    assert.strictEqual(cache.get('key'), null)
  })

  test('get returns null for malformed stored JSON instead of throwing', () => {
    globalThis.localStorage.setItem('corrupt', 'not-json{')
    assert.strictEqual(cache.get('corrupt'), null)
  })
})
