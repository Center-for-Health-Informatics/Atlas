// Minimal JSON Schema validator covering only the shapes roleJsonParser.js's
// static schemas use: type (object/array/string), required, properties, items.
// Not a general-purpose replacement for ajv - just enough to validate/report
// against those two schemas.
function validateNode (schema, data, path, errors) {
  if (schema.type === 'object') {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      errors.push(`${path} must be object`)
      return
    }
    for (const key of schema.required || []) {
      if (!(key in data)) {
        errors.push(`${path} must have required property '${key}'`)
      }
    }
    for (const key of Object.keys(schema.properties || {})) {
      if (key in data) {
        validateNode(schema.properties[key], data[key], `${path}/${key}`, errors)
      }
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(data)) {
      errors.push(`${path} must be array`)
      return
    }
    data.forEach((item, i) => validateNode(schema.items, item, `${path}[${i}]`, errors))
  } else if (schema.type === 'string') {
    if (typeof data !== 'string') {
      errors.push(`${path} must be string`)
    }
  }
}

export function validate (schema, data) {
  const errors = []
  validateNode(schema, data, 'data', errors)
  validate.errors = errors
  return errors.length === 0
}

export function errorsText (errors = validate.errors) {
  return (errors || []).join(', ')
}
