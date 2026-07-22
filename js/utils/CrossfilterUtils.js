// Hand-rolled replacement for the small subset of crossfilter2 actually used
// by this app (faceted-datatable, explore-cohort, ohdsi.util's
// SharedCrossfilter, profile-manager) -- see .rob/dependency-removal.md.
//
// Unlike real crossfilter, this recomputes each dimension/group from scratch
// on every read instead of maintaining incremental sorted indexes. That's
// the trade that makes this small: Atlas's crossfilter usage is on
// cohort/facet lists and profile records (hundreds to low thousands of
// rows), not the hundreds-of-thousands-of-rows datasets crossfilter's
// incremental algorithms exist for. Semantics (own-dimension filter
// exclusion on dimension.group()/groupAll(), any-element-match filtering
// on array-valued dimensions, filtered-record removal) were verified
// against the real crossfilter2 package -- see tests/utils/CrossfilterUtils.test.js.

function createGroup (getAllRecords, getIncluded, deriveKeys) {
  let reduceAdd = (p) => p + 1
  let reduceInitial = () => 0
  let orderValueOf = (d) => d.value

  function compute () {
    // The key space is every key that appears anywhere in the dimension's
    // data, not just among currently-included records -- matching real
    // crossfilter, a key filtered down to zero members still shows up with
    // value: reduceInitial() rather than disappearing from the group.
    const map = new Map()
    for (const record of getAllRecords()) {
      for (const key of deriveKeys(record)) {
        if (!map.has(key)) map.set(key, reduceInitial())
      }
    }
    for (const record of getIncluded()) {
      for (const key of deriveKeys(record)) {
        map.set(key, reduceAdd(map.get(key), record, true))
      }
    }
    return [...map.entries()]
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
  }

  const group = {
    reduce (add, remove, initial) {
      reduceAdd = add
      reduceInitial = initial
      return group
    },
    reduceCount () {
      return group.reduce((p) => p + 1, (p) => p - 1, () => 0)
    },
    reduceSum (valueAccessor) {
      return group.reduce((p, v) => p + valueAccessor(v), (p, v) => p - valueAccessor(v), () => 0)
    },
    order (valueAccessor) {
      orderValueOf = (d) => valueAccessor(d.value)
      return group
    },
    orderNatural () {
      return group.order((v) => v)
    },
    all () {
      return compute()
    },
    top (k) {
      return compute()
        .sort((a, b) => orderValueOf(b) - orderValueOf(a))
        .slice(0, k)
    },
    size () {
      return compute().length
    },
    dispose () {
      return group
    },
  }
  group.remove = group.dispose // for parity with crossfilter2's alias
  return group
}

function createSingletonGroup (getIncluded) {
  let reduceAdd = (p) => p + 1
  let reduceInitial = () => 0

  const group = {
    reduce (add, remove, initial) {
      reduceAdd = add
      reduceInitial = initial
      return group
    },
    reduceCount () {
      return group.reduce((p) => p + 1, (p) => p - 1, () => 0)
    },
    reduceSum (valueAccessor) {
      return group.reduce((p, v) => p + valueAccessor(v), (p, v) => p - valueAccessor(v), () => 0)
    },
    value () {
      let acc = reduceInitial()
      for (const record of getIncluded()) {
        acc = reduceAdd(acc, record, true)
      }
      return acc
    },
    dispose () {
      return group
    },
  }
  group.remove = group.dispose
  return group
}

export default function crossfilter (records = []) {
  let data = records.slice()
  const dimensions = []

  function computeIncluded (excludeDimension) {
    return data.filter((record) =>
      dimensions.every((dim) => dim === excludeDimension || dim.recordPasses(record)))
  }

  function dimension (accessor, isArray = false) {
    let filterFn = null // null means "no filter" -- every record passes

    function recordPasses (record) {
      if (!filterFn) return true
      const value = accessor(record)
      return isArray ? (value || []).some((v) => filterFn(v)) : filterFn(value)
    }

    function deriveKeys (keyFn) {
      return (record) => {
        const value = accessor(record)
        if (isArray) {
          const arr = value || []
          return keyFn ? arr.map(keyFn) : arr
        }
        return [keyFn ? keyFn(value) : value]
      }
    }

    const dim = {
      recordPasses,
      filter (range) {
        if (range === null || range === undefined) {
          filterFn = null
        } else if (typeof range === 'function') {
          filterFn = range
        } else if (Array.isArray(range)) {
          const [lo, hi] = range
          filterFn = (v) => v >= lo && v < hi
        } else {
          filterFn = (v) => v === range
        }
        return dim
      },
      filterAll () {
        return dim.filter(null)
      },
      group (keyFn) {
        return createGroup(() => data, () => computeIncluded(dim), deriveKeys(keyFn))
      },
      groupAll () {
        return createSingletonGroup(() => computeIncluded(dim))
      },
      dispose () {
        dim.filterAll()
        const i = dimensions.indexOf(dim)
        if (i >= 0) dimensions.splice(i, 1)
        return dim
      },
    }
    dim.filterFunction = dim.filter
    dimensions.push(dim)
    return dim
  }

  const cf = {
    dimension,
    groupAll () {
      return createSingletonGroup(() => computeIncluded(null))
    },
    size () {
      return data.length
    },
    all () {
      return data.slice()
    },
    allFiltered () {
      return computeIncluded(null)
    },
    add (newData) {
      data = data.concat(newData)
      return cf
    },
    remove (predicate) {
      const usePredicate = typeof predicate === 'function'
      data = data.filter((record) =>
        usePredicate ? !predicate(record) : !dimensions.every((dim) => dim.recordPasses(record)))
      return cf
    },
  }
  return cf
}
