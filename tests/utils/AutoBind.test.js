import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import AutoBind from '../../js/utils/AutoBind.js'

describe('AutoBind', () => {
  test('binds prototype methods to the instance context', () => {
    class Example extends AutoBind() {
      constructor () {
        super()
        this.counter = 1
      }

      increment () {
        return ++this.counter
      }
    }

    const instance = new Example()
    const { increment } = instance

    assert.strictEqual(increment(), 2)
    assert.strictEqual(instance.counter, 2)
  })

  test('leaves non-function prototype properties untouched', () => {
    class Sample extends AutoBind() {
      getName () {
        return this.componentName
      }
    }

    Sample.prototype.componentName = 'sample-component'

    const instance = new Sample()

    assert.strictEqual(instance.componentName, 'sample-component')
    assert.strictEqual(instance.getName(), 'sample-component')
  })
})
