import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import * as _ from '../../js/utils/NativeCompat.js'

describe('NativeCompat', () => {
  test('get reads nested paths and falls back to a default', () => {
    assert.strictEqual(_.get({ a: { b: { c: 5 } } }, 'a.b.c'), 5)
    assert.strictEqual(_.get({ a: 1 }, 'x.y', 'def'), 'def')
  })

  test('isEmpty treats nullish, empty, and populated values correctly', () => {
    assert.strictEqual(_.isEmpty(null), true)
    assert.strictEqual(_.isEmpty([]), true)
    assert.strictEqual(_.isEmpty({}), true)
    assert.strictEqual(_.isEmpty({ a: 1 }), false)
    assert.strictEqual(_.isEmpty([1]), false)
  })

  test('isEqual does a deep structural comparison', () => {
    assert.strictEqual(_.isEqual({ a: [1, 2] }, { a: [1, 2] }), true)
    assert.strictEqual(_.isEqual({ a: [1, 2] }, { a: [1, 3] }), false)
    assert.strictEqual(_.isEqual([1, 2], [1, 2]), true)
  })

  test('sortBy sorts by function, string key, or identity', () => {
    assert.deepStrictEqual(_.sortBy([3, 1, 2]), [1, 2, 3])
    assert.deepStrictEqual(_.sortBy([{ n: 'b' }, { n: 'a' }], ['n']), [{ n: 'a' }, { n: 'b' }])
    assert.deepStrictEqual(_.sortBy([1, 2, 3], (v) => -v), [3, 2, 1])
  })

  test('orderBy honors asc/desc direction', () => {
    const rows = [{ v: 1 }, { v: 3 }, { v: 2 }]
    assert.deepStrictEqual(_.orderBy(rows, ['v'], ['desc']), [{ v: 3 }, { v: 2 }, { v: 1 }])
  })

  test('uniqBy dedupes by iteratee, keeping first occurrence', () => {
    assert.deepStrictEqual(_.uniqBy([{ id: 1 }, { id: 2 }, { id: 1 }], 'id'), [{ id: 1 }, { id: 2 }])
  })

  test('range matches lodash including the descending-when-start>end quirk', () => {
    assert.deepStrictEqual(_.range(1, 11), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    assert.deepStrictEqual(_.range(10, 0), [10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    assert.deepStrictEqual(_.range(100, 400, 100), [100, 200, 300])
  })

  test('groupBy groups by iteratee, defaulting to identity', () => {
    assert.deepStrictEqual(_.groupBy(['x', 'y', 'x']), { x: ['x', 'x'], y: ['y'] })
  })

  test('mergeWith deep-merges with a customizer override and default array-by-index merge', () => {
    const customizer = (objValue, srcValue, key) => {
      if (key === 'tags' && Array.isArray(objValue)) return objValue.concat(srcValue)
    }
    const result = _.mergeWith({ nested: { a: 1 }, tags: ['x'], arr: [1, 2, 3] }, { nested: { b: 2 }, tags: ['y'], arr: [9] }, customizer)
    assert.deepStrictEqual(result, { nested: { a: 1, b: 2 }, tags: ['x', 'y'], arr: [9, 2, 3] })
  })

  test('differenceWith filters using a custom comparator', () => {
    const detectChanges = (a, b) => a[0] === b[0] && a[1] === b[1]
    assert.deepStrictEqual(_.differenceWith([['a', 1], ['b', 2]], [['a', 1]], detectChanges), [['b', 2]])
  })
})
