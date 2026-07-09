// Hand-rolled replacements for the small subset of lodash actually used by
// this app outside the _.chain()/_.template() call sites (see
// .rob/dependency-removal.md for why those two are excluded). Signatures
// match lodash closely enough for the argument shapes observed in this
// codebase -- they are not general-purpose reimplementations.

function isObjectLike (value) {
  return value !== null && typeof value === 'object'
}

function toPath (path) {
  return Array.isArray(path) ? path : String(path).split('.')
}

export function get (object, path, defaultValue) {
  let result = object
  for (const key of toPath(path)) {
    result = result === null || result === undefined ? undefined : result[key]
  }
  return result === undefined ? defaultValue : result
}

export function isEmpty (value) {
  if (value === null || value === undefined) {
    return true
  }
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length === 0
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }
  return true
}

export function isNil (value) {
  return value === null || value === undefined
}

export function isFinite (value) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function isEqual (a, b) {
  if (Object.is(a, b)) {
    return true
  }
  if (!isObjectLike(a) || !isObjectLike(b)) {
    return false
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false
    }
    return a.every((item, i) => isEqual(item, b[i]))
  }
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
  }
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && isEqual(a[key], b[key]))
}

export function each (collection, iteratee) {
  Array.prototype.forEach.call(collection, iteratee)
}

export function map (collection, iteratee) {
  if (Array.isArray(collection)) {
    return collection.map(iteratee)
  }
  return Object.entries(collection).map(([key, value]) => iteratee(value, key))
}

export function clone (value) {
  return Array.isArray(value) ? value.slice() : { ...value }
}

function toIteratee (iteratee) {
  if (typeof iteratee === 'function') {
    return iteratee
  }
  return (item) => item[iteratee]
}

export function sortBy (collection, iteratees) {
  const list = Array.isArray(iteratees) ? iteratees : iteratees ? [iteratees] : [(x) => x]
  const iters = list.map(toIteratee)
  return collection
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      for (const iter of iters) {
        const av = iter(a.item)
        const bv = iter(b.item)
        if (av < bv) return -1
        if (av > bv) return 1
      }
      return a.index - b.index
    })
    .map(({ item }) => item)
}

export function orderBy (collection, iteratees, orders) {
  const iters = (Array.isArray(iteratees) ? iteratees : [iteratees]).map(toIteratee)
  const dirs = Array.isArray(orders) ? orders : [orders || 'asc']
  return collection
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      for (let i = 0; i < iters.length; i++) {
        const av = iters[i](a.item)
        const bv = iters[i](b.item)
        const dir = dirs[i] === 'desc' ? -1 : 1
        if (av < bv) return -1 * dir
        if (av > bv) return 1 * dir
      }
      return a.index - b.index
    })
    .map(({ item }) => item)
}

export function uniq (array) {
  return [...new Set(array)]
}

export function uniqBy (array, iteratee) {
  const iter = toIteratee(iteratee)
  const seen = new Set()
  return array.filter((item) => {
    const key = iter(item)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

export function xor (a, b) {
  const setA = new Set(a)
  const setB = new Set(b)
  return [...a.filter((x) => !setB.has(x)), ...b.filter((x) => !setA.has(x))]
}

export function range (start, end, step) {
  if (end === undefined) {
    end = start
    start = 0
  }
  if (step === undefined) {
    step = start < end ? 1 : -1
  }
  const result = []
  if (step > 0) {
    for (let i = start; i < end; i += step) result.push(i)
  } else {
    for (let i = start; i > end; i += step) result.push(i)
  }
  return result
}

export function first (array) {
  return array ? array[0] : undefined
}

export function difference (array, values) {
  const exclude = new Set(values)
  return array.filter((item) => !exclude.has(item))
}

export function differenceWith (array, values, comparator) {
  return array.filter((item) => !values.some((value) => comparator(item, value)))
}

export function flatten (array) {
  return array.reduce((acc, item) => acc.concat(item), [])
}

export function groupBy (collection, iteratee = (item) => item) {
  const iter = toIteratee(iteratee)
  return collection.reduce((acc, item) => {
    const key = iter(item)
    ;(acc[key] = acc[key] || []).push(item)
    return acc
  }, {})
}

export function pick (object, keys) {
  const result = {}
  keys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = object[key]
    }
  })
  return result
}

export function omit (object, keys) {
  const excluded = new Set(keys)
  const result = {}
  Object.keys(object).forEach((key) => {
    if (!excluded.has(key)) {
      result[key] = object[key]
    }
  })
  return result
}

function isMergeableObject (value) {
  return value !== null && typeof value === 'object'
}

export function mergeWith (object, source, customizer) {
  if (!isMergeableObject(source)) {
    return object
  }
  Object.keys(source).forEach((key) => {
    const srcValue = source[key]
    const objValue = object[key]
    const custom = customizer ? customizer(objValue, srcValue, key, object, source) : undefined
    if (custom !== undefined) {
      object[key] = custom
    } else if (isMergeableObject(srcValue)) {
      const base = isMergeableObject(objValue) ? objValue : (Array.isArray(srcValue) ? [] : {})
      object[key] = mergeWith(base, srcValue, customizer)
    } else if (srcValue !== undefined) {
      object[key] = srcValue
    }
  })
  return object
}
