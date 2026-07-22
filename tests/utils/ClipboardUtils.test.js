import { test, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

class FakeElement {
  constructor (tagName) {
    this.tagName = tagName.toUpperCase()
    this.attributes = new Map()
    this.style = {}
    this.value = ''
    this.textContent = ''
  }

  setAttribute (name, value) { this.attributes.set(name, value) }
  getAttribute (name) { return this.attributes.has(name) ? this.attributes.get(name) : null }
  hasAttribute (name) { return this.attributes.has(name) }
  removeAttribute (name) { this.attributes.delete(name) }
  select () {}
}

function installFakeDocument ({ queryResult = null, execCommandResult = true } = {}) {
  const body = { children: [] }
  body.appendChild = (el) => body.children.push(el)
  body.removeChild = (el) => { body.children = body.children.filter((c) => c !== el) }

  globalThis.document = {
    createElement: (tag) => new FakeElement(tag),
    querySelector: () => queryResult,
    execCommand: () => execCommandResult,
    body
  }
}

// Node's own `navigator` global is a read-only getter (no setter), so it
// can't be reassigned directly - only redefined.
function setNavigator (value) {
  Object.defineProperty(globalThis, 'navigator', { value, configurable: true, writable: true })
}

const utils = await import('../../js/utils/ClipboardUtils.js')

describe('ClipboardUtils', () => {
  beforeEach(() => {
    installFakeDocument()
    setNavigator(undefined)
    globalThis.window = { isSecureContext: false }
  })

  describe('getSourceText', () => {
    test('prefers a literal data-clipboard-text attribute over any target', () => {
      const trigger = new FakeElement('button')
      trigger.setAttribute('data-clipboard-text', 'literal value')
      trigger.setAttribute('data-clipboard-target', '#ignored')
      assert.strictEqual(utils.getSourceText(trigger), 'literal value')
    })

    test('reads .value from an input/textarea/select target', () => {
      const target = new FakeElement('textarea')
      target.value = 'textarea contents'
      installFakeDocument({ queryResult: target })

      const trigger = new FakeElement('button')
      trigger.setAttribute('data-clipboard-target', '#cohortExpressionJSON')
      assert.strictEqual(utils.getSourceText(trigger), 'textarea contents')
    })

    test('reads .textContent from a non-form target', () => {
      const target = new FakeElement('pre')
      target.textContent = 'rendered text'
      installFakeDocument({ queryResult: target })

      const trigger = new FakeElement('button')
      trigger.setAttribute('data-clipboard-target', '#conceptSetExpression')
      assert.strictEqual(utils.getSourceText(trigger), 'rendered text')
    })

    test('returns an empty string when the target selector matches nothing', () => {
      installFakeDocument({ queryResult: null })
      const trigger = new FakeElement('button')
      trigger.setAttribute('data-clipboard-target', '#missing')
      assert.strictEqual(utils.getSourceText(trigger), '')
    })

    test('returns an empty string when there is no data-clipboard-* attribute at all', () => {
      const trigger = new FakeElement('button')
      assert.strictEqual(utils.getSourceText(trigger), '')
    })
  })

  describe('writeToClipboard', () => {
    test('uses navigator.clipboard.writeText in a secure context', async () => {
      let written = null
      setNavigator({ clipboard: { writeText: async (text) => { written = text } } })
      globalThis.window = { isSecureContext: true }

      const success = await utils.writeToClipboard('hello')
      assert.strictEqual(success, true)
      assert.strictEqual(written, 'hello')
    })

    test('falls back to execCommand when the Clipboard API rejects', async () => {
      setNavigator({ clipboard: { writeText: async () => { throw new Error('denied') } } })
      globalThis.window = { isSecureContext: true }
      installFakeDocument({ execCommandResult: true })

      assert.strictEqual(await utils.writeToClipboard('hello'), true)
    })

    test('uses the execCommand fallback directly outside a secure context', async () => {
      setNavigator({ clipboard: { writeText: async () => {} } })
      globalThis.window = { isSecureContext: false }
      installFakeDocument({ execCommandResult: true })

      assert.strictEqual(await utils.writeToClipboard('hello'), true)
    })

    test('propagates execCommand failure as a false return', async () => {
      globalThis.window = { isSecureContext: false }
      installFakeDocument({ execCommandResult: false })

      assert.strictEqual(await utils.writeToClipboard('hello'), false)
    })
  })
})
