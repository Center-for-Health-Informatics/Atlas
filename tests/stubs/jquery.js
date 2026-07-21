// jQuery 4 throws immediately at import time in a windowless environment
// (Node's test runner has no DOM), unlike 1.x which loaded permissively.
// App code under test doesn't exercise any DOM-manipulating jQuery calls,
// so a chainable no-op stands in here instead of a real jsdom dependency.
function noop () {
  return stub
}
const stub = new Proxy(noop, {
  get: () => noop,
})

export default stub
