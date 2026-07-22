// Replaces the `director` package's route compiler/matcher. Director always
// resolved a param name (`:id`, or `:id:` - the trailing colon is a no-op) to
// the same fixed capture group, since Atlas never registered custom matchers
// via director's `router.param()`. Segments containing a literal `\d`/`\w`
// escape (the app's few embedded-regex catch-all routes, e.g.
// '/profiles/?((\w|.)*)') are inserted verbatim instead of being treated as a
// param token - this mirrors director's own detection rule exactly.
const PARAM_TOKEN = /^:/
const RAW_REGEX_ESCAPE = /\\d|\\w/
const PARAM_CAPTURE = '([._a-zA-Z0-9-%()]+)'

export function compileRoute (pattern) {
  const segments = pattern.split('/').filter((segment) => segment.length > 0)
  const regexSegments = segments.map((segment) => {
    return (PARAM_TOKEN.test(segment) && !RAW_REGEX_ESCAPE.test(segment))
      ? PARAM_CAPTURE
      : segment
  })
  return new RegExp('^/' + regexSegments.join('/') + '$')
}

export function compileRoutes (routeMap) {
  return Object.keys(routeMap).map((pattern) => ({
    pattern,
    regex: compileRoute(pattern),
    handler: routeMap[pattern]
  }))
}

// First full match wins, in registration order - matches director's
// depth-first tree traversal (which iterates sibling keys in insertion
// order and returns on the first full match) for every route Atlas actually
// registers, including the specific-route-before-catch-all-splat pairs.
export function matchRoute (compiledRoutes, path) {
  const pathOnly = path.replace(/\?.*/, '')
  for (const route of compiledRoutes) {
    const match = pathOnly.match(route.regex)
    if (match) {
      return { handler: route.handler, captures: match.slice(1) }
    }
  }
  return null
}
