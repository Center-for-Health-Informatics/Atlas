// d3.nest() was removed after d3 v4. This replicates the specific subset of its
// behavior this app relies on: .key(fn).key(fn)....sortValues(cmp).entries(data),
// returning the same nested [{ key, values }] shape the old .entries() produced.
export function nestEntries (data, keyFns, compareFn) {
  function group (items, level) {
    const map = new Map()
    items.forEach((item) => {
      const key = keyFns[level](item)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(item)
    })
    const entries = Array.from(map, ([key, values]) => ({ key, values }))
    if (level + 1 < keyFns.length) {
      entries.forEach((entry) => { entry.values = group(entry.values, level + 1) })
    } else if (compareFn) {
      entries.forEach((entry) => { entry.values = entry.values.slice().sort(compareFn) })
    }
    return entries
  }
  return group(data, 0)
}
