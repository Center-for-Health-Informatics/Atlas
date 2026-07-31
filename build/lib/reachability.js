// Shared module-resolution + import-closure primitives, extracted from
// check-registrations.js so find-orphan-files.js and find-dead-components.js
// don't carry a second copy that could silently drift out of sync with how
// Vite actually resolves specifiers.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const js = p => path.join(ROOT, 'js', p)
export const rel = p => path.relative(ROOT, p)

const viteConfig = await import(pathToFileURL(path.join(ROOT, 'vite.config.js')))
const rawConfig = viteConfig.default
export const aliases = (typeof rawConfig === 'function'
  ? rawConfig({ command: 'build', mode: 'production' })
  : rawConfig).resolve.alias

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

// Returns { resolved, unresolved } — unresolved specifiers are logged by
// callers rather than silently dropped, since for orphan/dead-code detection
// (unlike check-registrations.js's narrower job) an unresolved first-party
// specifier is exactly the kind of miss that matters.
export function resolve (spec, from) {
  if (spec.startsWith('.')) return settle(path.resolve(path.dirname(from), spec))
  const aliased = applyAlias(spec)
  if (aliased) return settle(aliased)
  return null // bare npm package, or a genuinely unresolved first-party specifier
}

export function walk (dir, out = []) {
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

const STATIC_IMPORT_RE = /(?:^|\n)\s*import\s+(?:[^'"]*?from\s*)?['"]([^'"]+)['"]/g
const DYNAMIC_IMPORT_RE = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g

const importCache = new Map()
const unresolvedSpecs = new Map() // spec -> Set(referencing files)

export function staticImports (file) {
  if (importCache.has(file)) return importCache.get(file)
  let text = ''
  try { text = fs.readFileSync(file, 'utf8') } catch { /* generated or missing */ }
  const out = []
  let m
  STATIC_IMPORT_RE.lastIndex = 0
  while ((m = STATIC_IMPORT_RE.exec(text))) {
    const r = resolve(m[1], file)
    if (r && r.endsWith('.js')) {
      out.push(r)
    } else if (!r && m[1].startsWith('.')) {
      // A relative specifier that didn't resolve is a real miss, not a bare
      // npm package -- record it so callers can surface it instead of
      // treating this file's closure as complete when it silently isn't.
      if (!unresolvedSpecs.has(m[1])) unresolvedSpecs.set(m[1], new Set())
      unresolvedSpecs.get(m[1]).add(file)
    }
  }
  importCache.set(file, out)
  return out
}

export function dynamicSpecs (text) {
  const out = []
  let m
  DYNAMIC_IMPORT_RE.lastIndex = 0
  while ((m = DYNAMIC_IMPORT_RE.exec(text))) out.push(m[1])
  return out
}

export function getUnresolvedSpecs () {
  return unresolvedSpecs
}

// Fixpoint walk over BOTH static and dynamic imports, transitively -- this is
// the generalization find-orphan-files.js needs over check-registrations.js's
// per-route addClosure, which only expands specs handed to it by the caller.
// Also records every non-.js relative import target (.less/.css) seen along
// the way, in `styleTargets`, since a live .js file's `import './x.less'` is
// direct proof that sibling stylesheet is reachable too.
const STATIC_ANY_IMPORT_RE = /(?:^|\n)\s*import\s+(?:[^'"]*?from\s*)?['"]([^'"]+)['"]/g

export function reachableClosure (entry, seen, styleTargets = new Set()) {
  if (!entry || seen.has(entry)) return { seen, styleTargets }
  seen.add(entry)
  const stack = [entry]
  while (stack.length) {
    const file = stack.pop()
    for (const dep of staticImports(file)) {
      if (!seen.has(dep)) { seen.add(dep); stack.push(dep) }
    }
    let text = ''
    try { text = fs.readFileSync(file, 'utf8') } catch { /* generated or missing */ }
    for (const spec of dynamicSpecs(text)) {
      const dep = resolve(spec, file)
      if (dep && dep.endsWith('.js') && !seen.has(dep)) { seen.add(dep); stack.push(dep) }
    }
    let m
    STATIC_ANY_IMPORT_RE.lastIndex = 0
    while ((m = STATIC_ANY_IMPORT_RE.exec(text))) {
      if (/\.(less|css)$/.test(m[1]) && m[1].startsWith('.')) {
        const target = path.resolve(path.dirname(file), m[1])
        if (fs.existsSync(target)) styleTargets.add(target)
      }
    }
  }
  return { seen, styleTargets }
}

// ── Component registration / reference scanning (mirrors check-registrations.js) ──
const REGISTER_RE = /(?:ko\.components\.register\(\s*|commonUtils\.build\(\s*|\bbuild\(\s*)['"]([\w-]+)['"]/g
export function buildRegistry (files) {
  const registry = new Map()
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    let m
    REGISTER_RE.lastIndex = 0
    while ((m = REGISTER_RE.exec(text))) if (!registry.has(m[1])) registry.set(m[1], file)
  }
  return registry
}

const TAG_RE = /<([a-z][a-z0-9]*(?:-[a-z0-9]+)+)[\s>]/g
const NAME_RE = /componentName:\s*['"]([\w-]+)['"]|\bcomponent:\s*\{\s*name:\s*['"]([\w-]+)['"]/g
const BADGE_RE = /componentName:\s*['"]([\w-]+)['"][\s\S]{0,400}?hasBadge:\s*true|hasBadge:\s*true[\s\S]{0,400}?componentName:\s*['"]([\w-]+)['"]/g

// check-registrations.js's basename-match assumption (Foo.js -> Foo.html)
// holds for the 207/219 kebab-case component modules, but the older
// PascalCase cohortbuilder/cohortdefinitionviewer components load a
// differently-named template via `import view from './XTemplate.html?raw'`
// -- basename matching silently finds nothing for those, so their templates
// (and every <tag> inside them) never get scanned. Prefer the actual `?raw`
// import target; fall back to basename.html.
const RAW_IMPORT_RE = /import\s+\w+\s+from\s+['"](\.[^'"]+\.html)\?raw['"]/
function templateFor (file) {
  const text = fs.readFileSync(file, 'utf8')
  const m = RAW_IMPORT_RE.exec(text)
  if (m) {
    const target = path.resolve(path.dirname(file), m[1])
    if (fs.existsSync(target)) return target
  }
  const bySameName = file.replace(/\.js$/, '.html')
  return fs.existsSync(bySameName) ? bySameName : null
}

export function references (modules, registry) {
  const refs = new Map()
  const note = (name, file) => { if (registry.has(name) && !refs.has(name)) refs.set(name, file) }
  for (const file of modules) {
    const texts = [fs.readFileSync(file, 'utf8')]
    const html = templateFor(file)
    if (html) texts.push(fs.readFileSync(html, 'utf8'))
    for (const text of texts) {
      let m
      TAG_RE.lastIndex = 0; while ((m = TAG_RE.exec(text))) note(m[1], file)
      NAME_RE.lastIndex = 0; while ((m = NAME_RE.exec(text))) note(m[1] || m[2], file)
      BADGE_RE.lastIndex = 0; while ((m = BADGE_RE.exec(text))) note((m[1] || m[2]) + '-badge', file)
    }
  }
  return refs
}
