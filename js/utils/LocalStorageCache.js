// TTL-aware localStorage wrapper, replacing the lscache package (whose real
// usage here was just get/set/remove with a minutes-based expiration).
function isSupported () {
  try {
    return typeof localStorage !== 'undefined'
  } catch (e) {
    return false
  }
}

export function get (key) {
  if (!isSupported()) return null
  const raw = localStorage.getItem(key)
  if (raw === null) return null

  let entry
  try {
    entry = JSON.parse(raw)
  } catch (e) {
    return null
  }

  if (entry.expiry !== null && Date.now() >= entry.expiry) {
    localStorage.removeItem(key)
    return null
  }
  return entry.value
}

export function set (key, value, minutes) {
  if (!isSupported()) return
  const expiry = minutes ? Date.now() + minutes * 60 * 1000 : null
  try {
    localStorage.setItem(key, JSON.stringify({ value, expiry }))
  } catch (e) {
    // Quota exceeded or value not serializable - same as lscache, just skip caching.
  }
}

export function remove (key) {
  if (!isSupported()) return
  localStorage.removeItem(key)
}
