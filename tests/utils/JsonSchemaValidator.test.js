import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { validate, errorsText } from '../../js/utils/JsonSchemaValidator.js'

// Same shape as the two static schemas in js/pages/configuration/roles/roleJsonParser.js
const roleJSONSchema = {
  type: 'object',
  required: ['role'],
  properties: {
    role: { type: 'string' },
    users: { type: 'array', items: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
    permissions: { type: 'array', items: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
  },
}
const rolesJSONSchema = { type: 'array', items: roleJSONSchema }

describe('JsonSchemaValidator', () => {
  test('accepts a valid role object', () => {
    assert.strictEqual(validate(roleJSONSchema, { role: 'Admin', users: [{ id: 'u1' }], permissions: [{ id: 'p1' }] }), true)
  })

  test('accepts a role object with only the required property', () => {
    assert.strictEqual(validate(roleJSONSchema, { role: 'Admin' }), true)
  })

  test('rejects a missing required property', () => {
    assert.strictEqual(validate(roleJSONSchema, { users: [] }), false)
    assert.match(errorsText(), /must have required property 'role'/)
  })

  test('rejects a property of the wrong type', () => {
    assert.strictEqual(validate(roleJSONSchema, { role: 123 }), false)
    assert.match(errorsText(), /role.*must be string/)
  })

  test('rejects a nested array item missing its own required property', () => {
    assert.strictEqual(validate(roleJSONSchema, { role: 'x', users: [{}] }), false)
    assert.match(errorsText(), /must have required property 'id'/)
  })

  test('rejects a non-object where an object is expected', () => {
    assert.strictEqual(validate(roleJSONSchema, 'nope'), false)
    assert.strictEqual(validate(roleJSONSchema, null), false)
    assert.strictEqual(validate(roleJSONSchema, ['a']), false)
  })

  test('accepts a valid array of roles', () => {
    assert.strictEqual(validate(rolesJSONSchema, [{ role: 'A' }, { role: 'B', permissions: [{ id: 'p' }] }]), true)
  })

  test('rejects an array containing an invalid role', () => {
    assert.strictEqual(validate(rolesJSONSchema, [{ role: 'A' }, { users: 'not-an-array' }]), false)
    const errors = errorsText()
    assert.match(errors, /must have required property 'role'/)
    assert.match(errors, /must be array/)
  })

  test('rejects a non-array where the array schema expects one', () => {
    assert.strictEqual(validate(rolesJSONSchema, { role: 'A' }), false)
    assert.match(errorsText(), /must be array/)
  })

  test('errorsText defaults to the errors from the most recent validate() call', () => {
    validate(roleJSONSchema, {})
    const lastErrors = errorsText()
    assert.match(lastErrors, /required property 'role'/)
  })
})
