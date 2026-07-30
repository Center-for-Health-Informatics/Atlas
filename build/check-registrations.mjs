// Static check for Knockout components that a route references but never
// registers.
//
// Knockout components register themselves as a side effect of their module
// body running (`ko.components.register(...)` / `commonUtils.build(...)`), so a
// component is available on a route only if some module in that route's import
// closure actually loads. The repo convention is that whichever module's
// template contains `<foo-bar>` is the module that imports `foo-bar`.
//
// When that convention is broken the page still works for as long as something
// unrelated happens to be eager -- and then silently breaks the day the bundle
// splits differently or a route stops eagerly importing half the app. That is
// not hypothetical: de-eagering `js/pages/characterizations/routes.js` unmasked
// three such registrations at once (see MIGRATION_STATUS.md).
//
// Browser testing does not catch these, because the references sit behind
// conditions a smoke test does not hit -- `<access-denied>` only renders for a
// user without permission, and half the rest live inside modals and tabs.
//
// Usage: npm run check:registrations   (exits 1 if anything is missing)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const js = p => path.join(ROOT, 'js', p)
const rel = p => path.relative(ROOT, p)

// ── Module resolution ────────────────────────────────────────────────────────
// Take the aliases from vite.config.js itself rather than keeping a second copy
// here; a stale copy would silently truncate import closures and invent
// failures.
const viteConfig = await import(pathToFileURL(path.join(ROOT, 'vite.config.js')))
const rawConfig = viteConfig.default
const aliases = (typeof rawConfig === 'function'
  ? rawConfig({ command: 'build', mode: 'production' })
  : rawConfig).resolve.alias

// Vite resolves a `.js`-less specifier through the same extension/index probing
// Node does, so mirror that here.
const settle = p => [p, p + '.js', path.join(p, 'main.js'), path.join(p, 'index.js')]
  .find(c => fs.existsSync(c) && fs.statSync(c).isFile()) || null

function applyAlias (spec) {
  for (const { find, replacement } of aliases) {
    if (find instanceof RegExp) {
      if (find.test(spec)) return spec.replace(find, replacement)
    } else if (spec === find) {
      return replacement
    } else if (spec.startsWith(find + '/')) {
      return replacement + spec.slice(find.length)
    }
  }
  return null
}

function resolve (spec, from) {
  if (spec.startsWith('.')) return settle(path.resolve(path.dirname(from), spec))
  const aliased = applyAlias(spec)
  // Anything left is a real npm package; none of them register Atlas components.
  return aliased ? settle(aliased) : null
}

function walk (dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!p.includes(path.join('assets', 'bundle'))) walk(p, out)
    } else if (entry.name.endsWith('.js')) {
      out.push(p)
    }
  }
  return out
}

// ── Who registers what ───────────────────────────────────────────────────────
const REGISTER_RE = /(?:ko\.components\.register\(\s*|commonUtils\.build\(\s*|\bbuild\(\s*)['"]([\w-]+)['"]/g
const registry = new Map()
for (const file of walk(js(''))) {
  const text = fs.readFileSync(file, 'utf8')
  let m
  REGISTER_RE.lastIndex = 0
  while ((m = REGISTER_RE.exec(text))) if (!registry.has(m[1])) registry.set(m[1], file)
}

// ── Import closures ──────────────────────────────────────────────────────────
const STATIC_IMPORT_RE = /(?:^|\n)\s*import\s+(?:[^'"]*?from\s*)?['"]([^'"]+)['"]/g
const DYNAMIC_IMPORT_RE = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g

const importCache = new Map()
function staticImports (file) {
  if (importCache.has(file)) return importCache.get(file)
  let text = ''
  try { text = fs.readFileSync(file, 'utf8') } catch { /* generated or missing */ }
  const out = []
  let m
  STATIC_IMPORT_RE.lastIndex = 0
  while ((m = STATIC_IMPORT_RE.exec(text))) {
    const r = resolve(m[1], file)
    if (r && r.endsWith('.js')) out.push(r)
  }
  importCache.set(file, out)
  return out
}

function addClosure (entry, seen) {
  if (!entry || seen.has(entry)) return seen
  seen.add(entry)
  const stack = [entry]
  while (stack.length) {
    for (const dep of staticImports(stack.pop())) {
      if (!seen.has(dep)) { seen.add(dep); stack.push(dep) }
    }
  }
  return seen
}

function dynamicSpecs (text) {
  const out = []
  let m
  DYNAMIC_IMPORT_RE.lastIndex = 0
  while ((m = DYNAMIC_IMPORT_RE.exec(text))) out.push(m[1])
  return out
}

// ── Which components a module tree references ────────────────────────────────
const TAG_RE = /<([a-z][a-z0-9]*(?:-[a-z0-9]+)+)[\s>]/g
const NAME_RE = /componentName:\s*['"]([\w-]+)['"]|\bcomponent:\s*\{\s*name:\s*['"]([\w-]+)['"]/g
// components/tabs.html renders `${componentName}-badge` for any tab with hasBadge,
// so those names never appear as literal strings anywhere in the source.
const BADGE_RE = /componentName:\s*['"]([\w-]+)['"][\s\S]{0,400}?hasBadge:\s*true|hasBadge:\s*true[\s\S]{0,400}?componentName:\s*['"]([\w-]+)['"]/g

function references (modules) {
  const refs = new Map()
  // Names no module registers are plain custom elements, not KO components.
  const note = (name, file) => { if (registry.has(name) && !refs.has(name)) refs.set(name, file) }
  for (const file of modules) {
    const texts = [fs.readFileSync(file, 'utf8')]
    const html = file.replace(/\.js$/, '.html')
    if (fs.existsSync(html)) texts.push(fs.readFileSync(html, 'utf8'))
    for (const text of texts) {
      let m
      TAG_RE.lastIndex = 0; while ((m = TAG_RE.exec(text))) note(m[1], file)
      NAME_RE.lastIndex = 0; while ((m = NAME_RE.exec(text))) note(m[1] || m[2], file)
      BADGE_RE.lastIndex = 0; while ((m = BADGE_RE.exec(text))) note((m[1] || m[2]) + '-badge', file)
    }
  }
  return refs
}

// ── Boot closure ─────────────────────────────────────────────────────────────
// Anything main.js reaches before the router dispatches is registered for every
// route, so it can never be the missing piece.
const boot = new Set()
for (const entry of ['main.js', 'Application.js', 'pages/Router.js', 'pages/main.js']) {
  addClosure(js(entry), boot)
}
for (const spec of dynamicSpecs(fs.readFileSync(js('main.js'), 'utf8'))) {
  addClosure(resolve(spec, js('main.js')), boot)
}
const bootRegistered = new Set(
  [...registry].filter(([, file]) => boot.has(file)).map(([name]) => name)
)

// ── Per-route check ──────────────────────────────────────────────────────────
const routeFiles = walk(js('pages')).filter(f => f.endsWith(path.sep + 'routes.js'))
let total = 0

for (const routeFile of routeFiles) {
  const text = fs.readFileSync(routeFile, 'utf8')
  // Each `new Route(...)` / `new AuthorizedRoute(...)` handler loads its own
  // set of modules; splitting on the constructor is enough to separate them.
  const handlers = text.split(/new\s+(?:Authorized)?Route\s*\(/).slice(1)
  const inHandler = new Set()
  const perRoute = handlers.map(chunk => {
    const specs = new Set(dynamicSpecs(chunk))
    for (const s of specs) inHandler.add(s)
    return specs
  })
  // Shared helpers such as `loadCohortEditor()` sit outside any handler; treat
  // their imports as reachable from every route in the file.
  const fileLevel = dynamicSpecs(text).filter(s => !inHandler.has(s))

  perRoute.forEach((specs, i) => {
    const all = new Set([...specs, ...fileLevel])
    if (!all.size) return
    const modules = new Set()
    addClosure(routeFile, modules)
    for (const spec of all) addClosure(resolve(spec, routeFile), modules)

    const missing = [...references(modules)]
      .filter(([name]) => !bootRegistered.has(name) && !modules.has(registry.get(name)))
    if (!missing.length) return

    total += missing.length
    console.log(`\n${rel(routeFile)}  route #${i + 1}`)
    for (const [name, referencedBy] of missing) {
      console.log(`  MISSING '${name}'`)
      console.log(`    referenced by ${rel(referencedBy)}`)
      console.log(`    registered by ${rel(registry.get(name))}  <- add a bare import of this to the referencing module`)
    }
  })
}

if (total) {
  console.log(`\n${total} missing component registration(s) across ${routeFiles.length} routes.js files`)
  process.exit(1)
}
console.log(`No missing component registrations (${routeFiles.length} routes.js files, ${registry.size} components).`)
