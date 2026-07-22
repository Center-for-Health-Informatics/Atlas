import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { compileRoute, compileRoutes, matchRoute } from '../../js/utils/HashRouter.js'

describe('HashRouter', () => {
  describe('compileRoute', () => {
    test('matches a plain literal route', () => {
      assert.ok(compileRoute('/tools').test('/tools'))
      assert.ok(!compileRoute('/tools').test('/tools/extra'))
    })

    test('compiles a bare :param the same as a trailing-colon :param: - the trailing colon is a no-op', () => {
      const bare = compileRoute('/x/:id')
      const trailing = compileRoute('/x/:id:')
      assert.strictEqual(bare.source, trailing.source)
      assert.deepStrictEqual('/x/42'.match(bare).slice(1), ['42'])
      assert.deepStrictEqual('/x/42'.match(trailing).slice(1), ['42'])
    })

    test('matches a route with no leading slash the same as one with it', () => {
      assert.deepStrictEqual(compileRoute('cc/characterizations').source, compileRoute('/cc/characterizations').source)
    })

    test('matches multiple params in order', () => {
      const regex = compileRoute('/welcome/:authClient/:token/:url')
      const match = '/welcome/oauth/abc123/https'.match(regex)
      assert.deepStrictEqual(match.slice(1), ['oauth', 'abc123', 'https'])
    })

    test('matches the root pattern only against exactly "/"', () => {
      const regex = compileRoute('/')
      assert.ok(regex.test('/'))
      assert.ok(!regex.test('/home'))
    })

    test('inserts an embedded-regex catch-all segment verbatim, capturing the splat', () => {
      const regex = compileRoute('/profiles/?((\\w|.)*)')
      const match = '/profiles/foo/bar'.match(regex)
      assert.ok(match)
      assert.strictEqual(match[0], '/profiles/foo/bar')
    })

    test('matches the real cohort-definition catch-all route with cohortDefinitionId + splat captures', () => {
      const regex = compileRoute('/cohortdefinition/:cohortDefinitionId:/?((\\w|.)*)')
      const match = '/cohortdefinition/123/conceptsets'.match(regex)
      assert.ok(match)
      assert.strictEqual(match[1], '123')
    })
  })

  describe('compileRoutes', () => {
    test('preserves route definition order', () => {
      const routeMap = { '/b': () => 'b', '/a': () => 'a', '/c': () => 'c' }
      const compiled = compileRoutes(routeMap)
      assert.deepStrictEqual(compiled.map((r) => r.pattern), ['/b', '/a', '/c'])
    })
  })

  describe('matchRoute', () => {
    test('returns the handler and captures for a matching route', () => {
      const compiled = compileRoutes({ '/role/:id': (id) => `role-${id}` })
      const result = matchRoute(compiled, '/role/7')
      assert.strictEqual(result.handler('7'), 'role-7')
      assert.deepStrictEqual(result.captures, ['7'])
    })

    test('returns null when nothing matches', () => {
      const compiled = compileRoutes({ '/role/:id': () => {} })
      assert.strictEqual(matchRoute(compiled, '/nope'), null)
    })

    test('strips a query string before matching', () => {
      const compiled = compileRoutes({ '/search': () => 'search' })
      const result = matchRoute(compiled, '/search?query=foo')
      assert.ok(result)
      assert.strictEqual(result.handler(), 'search')
    })

    test('a specific route registered before a catch-all wins for a path both could match', () => {
      const routeMap = {
        '/cohortdefinition/:cohortDefinitionId/samples': () => 'specific-samples',
        '/cohortdefinition/:cohortDefinitionId/version/:version': () => 'specific-version',
        '/cohortdefinition/:cohortDefinitionId:/?((\\w|.)*)': () => 'catch-all'
      }
      const compiled = compileRoutes(routeMap)
      assert.strictEqual(matchRoute(compiled, '/cohortdefinition/123/samples').handler(), 'specific-samples')
      assert.strictEqual(matchRoute(compiled, '/cohortdefinition/123/version/5').handler(), 'specific-version')
      assert.strictEqual(matchRoute(compiled, '/cohortdefinition/123/definition').handler(), 'catch-all')
    })
  })
})
