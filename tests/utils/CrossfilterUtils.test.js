import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import crossfilter from '../../js/utils/CrossfilterUtils.js'

// Expected values in this file were captured by running the equivalent
// operations against the real crossfilter2 package (see .rob/dependency-removal.md
// for the probe scripts used) -- this shim intentionally recomputes from
// scratch rather than maintaining crossfilter's incremental sorted indexes,
// so these tests pin the observable behavior, not the implementation.

function makeData () {
  return [
    { id: 1, domain: 'Drug', tags: ['a', 'b'], people: 5 },
    { id: 2, domain: 'Condition', tags: ['b', 'c'], people: 3 },
    { id: 3, domain: 'Drug', tags: ['a'], people: 2 },
    { id: 4, domain: 'Procedure', tags: [], people: 7 },
    { id: 5, domain: 'Condition', tags: ['c'], people: 1 },
  ]
}

// A tie-free-by-count/sum dataset for the order-sensitive top()/all() assertions --
// real crossfilter's tie-break order among equal values is a heap-selection
// artifact, not a documented contract, so exact-order tests avoid ties rather
// than pin behavior this shim doesn't try to replicate.
function makeOrderedData () {
  return [
    { id: 1, domain: 'Drug', people: 5 },
    { id: 2, domain: 'Drug', people: 3 },
    { id: 3, domain: 'Drug', people: 2 },
    { id: 4, domain: 'Condition', people: 4 },
    { id: 5, domain: 'Condition', people: 2 },
    { id: 6, domain: 'Procedure', people: 1 },
  ]
}

describe('CrossfilterUtils', () => {
  test('size/all/allFiltered are unfiltered by default', () => {
    const cf = crossfilter(makeData())
    assert.strictEqual(cf.size(), 5)
    assert.deepStrictEqual(cf.allFiltered().map((d) => d.id), [1, 2, 3, 4, 5])
  })

  test('default group() reduces to count, ordered by key ascending in all()', () => {
    const cf = crossfilter(makeOrderedData())
    const dim = cf.dimension((d) => d.domain)
    assert.deepStrictEqual(dim.group().all(), [
      { key: 'Condition', value: 2 },
      { key: 'Drug', value: 3 },
      { key: 'Procedure', value: 1 },
    ])
  })

  test('default group().top(Infinity) is ordered by count descending', () => {
    const cf = crossfilter(makeOrderedData())
    const dim = cf.dimension((d) => d.domain)
    assert.deepStrictEqual(dim.group().top(Infinity), [
      { key: 'Drug', value: 3 },
      { key: 'Condition', value: 2 },
      { key: 'Procedure', value: 1 },
    ])
  })

  test('reduceSum group top(Infinity) is ordered by value descending', () => {
    const cf = crossfilter(makeOrderedData())
    const dim = cf.dimension((d) => d.domain)
    assert.deepStrictEqual(dim.group().reduceSum((d) => d.people).top(Infinity), [
      { key: 'Drug', value: 10 },
      { key: 'Condition', value: 6 },
      { key: 'Procedure', value: 1 },
    ])
  })

  test('a dimension excludes its own filter from its group()/groupAll(), but not from other dimensions', () => {
    const cf = crossfilter(makeData())
    const domainDim = cf.dimension((d) => d.domain)
    const tagsDim = cf.dimension((d) => d.tags, true)
    domainDim.filter((v) => v === 'Condition')

    assert.deepStrictEqual(domainDim.group().all(), [
      { key: 'Condition', value: 2 },
      { key: 'Drug', value: 2 },
      { key: 'Procedure', value: 1 },
    ], 'own dimension group ignores its own filter')

    assert.deepStrictEqual(tagsDim.group().all(), [
      { key: 'a', value: 0 },
      { key: 'b', value: 1 },
      { key: 'c', value: 2 },
    ], 'other dimension group reflects the filter')

    assert.deepStrictEqual(cf.allFiltered().map((d) => d.id), [2, 5])
    assert.strictEqual(domainDim.groupAll().value(), 5, 'dimension groupAll ignores its own filter')
    assert.strictEqual(cf.groupAll().value(), 2, 'crossfilter-level groupAll respects all filters')
  })

  test('array-valued dimension filters/groups by any matching element', () => {
    const cf = crossfilter(makeData())
    const tagsDim = cf.dimension((d) => d.tags, true)
    tagsDim.filter((v) => v === 'a' || v === 'c')

    assert.deepStrictEqual(cf.allFiltered().map((d) => d.id).sort(), [1, 2, 3, 5])
    assert.deepStrictEqual(tagsDim.group().all(), [
      { key: 'a', value: 2 },
      { key: 'b', value: 2 },
      { key: 'c', value: 2 },
    ])
  })

  test('custom group key function with a custom 3-arg reduce (the reduceToRecs pattern)', () => {
    const cf = crossfilter(makeData())
    const domainDim = cf.dimension((d) => d.domain)
    const reduceToRecs = [
      (p, v) => p.concat(v),
      (p, v) => p.filter((x) => x !== v),
      () => [],
    ]
    const g = domainDim.group((d) => d[0]).reduce(...reduceToRecs)
    assert.deepStrictEqual(g.all().map(({ key, value }) => ({ key, ids: value.map((v) => v.id) })), [
      { key: 'C', ids: [2, 5] },
      { key: 'D', ids: [1, 3] },
      { key: 'P', ids: [4] },
    ])
  })

  test('cf.remove() with no predicate removes currently filtered-in records', () => {
    const cf = crossfilter(makeData())
    const dim = cf.dimension((d) => d.domain)
    dim.filter((v) => v === 'Drug')
    cf.remove()
    dim.filterAll()
    assert.deepStrictEqual(cf.allFiltered().map((d) => d.id).sort(), [2, 4, 5])
    assert.strictEqual(cf.size(), 3)
  })

  test('cf.remove(predicate) removes matching records regardless of active filters', () => {
    const cf = crossfilter(makeData())
    cf.remove((d) => d.id === 2)
    assert.deepStrictEqual(cf.allFiltered().map((d) => d.id).sort(), [1, 3, 4, 5])
    assert.strictEqual(cf.size(), 4)
  })

  test('cf.add() appends new records', () => {
    const cf = crossfilter(makeData())
    cf.add([{ id: 6, domain: 'Drug', tags: ['x'], people: 9 }])
    assert.strictEqual(cf.size(), 6)
    assert.deepStrictEqual(cf.allFiltered().map((d) => d.id), [1, 2, 3, 4, 5, 6])
  })

  test('dimension.dispose() removes its influence on other dimensions', () => {
    const cf = crossfilter(makeData())
    const domainDim = cf.dimension((d) => d.domain)
    const tagsDim = cf.dimension((d) => d.tags, true)
    domainDim.filter((v) => v === 'Condition')
    domainDim.dispose()

    assert.deepStrictEqual(tagsDim.group().all(), [
      { key: 'a', value: 2 },
      { key: 'b', value: 2 },
      { key: 'c', value: 2 },
    ])
    assert.deepStrictEqual(cf.allFiltered().map((d) => d.id).sort(), [1, 2, 3, 4, 5])
  })

  test('dimension.filter(null) and filterAll() both clear the filter', () => {
    const cf = crossfilter(makeData())
    const dim = cf.dimension((d) => d.domain)
    dim.filter((v) => v === 'Drug')
    assert.strictEqual(cf.allFiltered().length, 2)
    dim.filter(null)
    assert.strictEqual(cf.allFiltered().length, 5)
    dim.filter((v) => v === 'Drug')
    dim.filterAll()
    assert.strictEqual(cf.allFiltered().length, 5)
  })

  test('faceted-datatable pattern: group().top(Infinity) shape used to build facet items', () => {
    const cf = crossfilter(makeOrderedData())
    const dim = cf.dimension((d) => d.domain)
    const items = dim.group().top(Number.POSITIVE_INFINITY)
    assert.deepStrictEqual(items, [
      { key: 'Drug', value: 3 },
      { key: 'Condition', value: 2 },
      { key: 'Procedure', value: 1 },
    ])
  })
})
