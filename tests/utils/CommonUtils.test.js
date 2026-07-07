import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import ko from 'knockout'
import commonUtils from '../../js/utils/CommonUtils.js'
import appConfig from '../stubs/appConfig.js'

describe('CommonUtils', () => {
  test('normalizeUrl combines segments without duplicate slashes', () => {
    assert.strictEqual(commonUtils.normalizeUrl('/path/', '/to/', 'resource'), '/path/to/resource')
  })

  test('cartesian produces all permutations across multiple arrays', () => {
    const result = commonUtils.cartesian([1, 2], ['a'], ['x', 'y'])
    assert.deepStrictEqual(result, [
      [1, 'a', 'x'],
      [1, 'a', 'y'],
      [2, 'a', 'x'],
      [2, 'a', 'y'],
    ])
  })

  test('escapeTooltip escapes both single and double quotes', () => {
    const escaped = commonUtils.escapeTooltip('Bob\'s "quote"')
    assert.strictEqual(escaped, 'Bob\\\'s &quot;quote&quot;')
  })

  // Regression test: getSelectedConcepts used to strip the `isSelected`
  // observable off each returned concept, which silently broke
  // clearConceptsSelectionState()'s ability to uncheck a concept after it was
  // added to a concept set (it was resetting stripped copies, not the live
  // observables) — concepts could get added twice as a result. It must
  // return the live objects, isSelected included.
  test('getSelectedConcepts returns the live selected items with isSelected intact', () => {
    const concepts = ko.observableArray([
      { id: 1, name: 'A', isSelected: () => true },
      { id: 2, name: 'B', isSelected: () => false },
    ])

    const result = commonUtils.getSelectedConcepts(concepts)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].id, 1)
    assert.strictEqual(result[0].name, 'A')
    assert.strictEqual(typeof result[0].isSelected, 'function')
  })

  test('clearConceptsSelectionState resets observable selection flags', () => {
    const first = { id: 1, isSelected: ko.observable(true) }
    const second = { id: 2, isSelected: ko.observable(false) }
    const conceptList = ko.observableArray([first, second])

    commonUtils.clearConceptsSelectionState(conceptList)

    assert.strictEqual(first.isSelected(), false)
    assert.strictEqual(second.isSelected(), false)
  })

  test('buildConceptSetItems merges shared options into each entry', () => {
    const options = ko.observable({
      includeDescendants: true,
      isExcluded: false,
    })
    const concepts = [
      { conceptId: 1 },
      { conceptId: 2 },
    ]

    const items = commonUtils.buildConceptSetItems(concepts, options)

    assert.deepStrictEqual(items, [
      { concept: concepts[0], includeDescendants: true, isExcluded: false },
      { concept: concepts[1], includeDescendants: true, isExcluded: false },
    ])
  })

  test('getTableOptions returns variant specific datatable preferences', () => {
    assert.deepStrictEqual(commonUtils.getTableOptions('XS'), {
      pageLength: appConfig.commonDataTableOptions.pageLength.XS,
      lengthMenu: appConfig.commonDataTableOptions.lengthMenu.XS,
    })
  })
})
