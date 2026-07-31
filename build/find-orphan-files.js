// Phase 1 of the dead-code audit: whole-app reachability, generalized from
// check-registrations.js's per-route question ("does this route register
// what it references") to a global one ("is this file reached from anywhere
// at all"). See DEAD_CODE_AUDIT.md for the report this feeds and the
// per-candidate verification protocol applied before anything here is
// treated as confirmed-dead.
//
// Usage: node build/find-orphan-files.js
import fs from 'node:fs'
import path from 'node:path'
import {
  ROOT, js, rel, walk, reachableClosure, getUnresolvedSpecs
} from './lib/reachability.js'

// ── Boot closure: always-reachable entry points ──────────────────────────────
const seen = new Set()
const styleTargets = new Set()
for (const entry of ['main.js', 'Application.js', 'pages/Router.js', 'pages/main.js']) {
  reachableClosure(js(entry), seen, styleTargets)
}

// index.html loads a non-module <script src> directly (runtime-config.js),
// outside any JS import graph -- the closure walker can't see that on its
// own, so treat every same-origin <script src="..."> in index.html as an
// entry point too.
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
for (const m of indexHtml.matchAll(/<script[^>]*\ssrc=["']([^"']+)["']/g)) {
  const src = m[1].replace(/^\/atlas\//, '/').replace(/^\//, '')
  const target = path.join(ROOT, src)
  if (fs.existsSync(target)) reachableClosure(target, seen, styleTargets)
}

// Every routes.js is its own entry point, same convention check-registrations.js
// already relies on: a route table is reachable as data even though nothing
// necessarily *imports* it by name.
const routeFiles = walk(js('pages')).filter(f => f.endsWith(path.sep + 'routes.js'))
for (const routeFile of routeFiles) reachableClosure(routeFile, seen, styleTargets)

const appReachable = new Set(seen)

// ── Test closure: walked separately and labeled, not folded into "live" ──────
function walkTests (dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) walkTests(p, out)
    else if (entry.name.endsWith('.test.js')) out.push(p)
  }
  return out
}
const testFiles = walkTests(path.join(ROOT, 'tests'))
const testSeen = new Set()
const testStyleTargets = new Set()
for (const t of testFiles) reachableClosure(t, testSeen, testStyleTargets)

// ── Full file inventory under js/ ─────────────────────────────────────────────
function walkAll (dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!p.includes(path.join('assets', 'bundle'))) walkAll(p, out)
    } else if (/\.(js|html|less)$/.test(entry.name)) {
      out.push(p)
    }
  }
  return out
}
const allFiles = walkAll(js(''))

// ── Classify ───────────────────────────────────────────────────────────────
const orphanJs = []
const orphanHtml = []
const orphanLess = []
const testOnlyJs = []

for (const file of allFiles) {
  if (file.endsWith('.js')) {
    if (appReachable.has(file)) continue
    if (testSeen.has(file)) { testOnlyJs.push(file); continue }
    orphanJs.push(file)
  } else if (file.endsWith('.html')) {
    const sibling = file.replace(/\.html$/, '.js')
    if (fs.existsSync(sibling)) {
      // .html orphan status follows its sibling .js -- reported once, under
      // the .js entry, not duplicated here.
      continue
    }
    // No sibling .js (a partial/template). Weak signal only: flag for manual
    // review, never treat as high-confidence on its own.
    const base = path.basename(file, '.html')
    const referencedElsewhere = allFiles.some(f =>
      f !== file && f.endsWith('.js') && fs.readFileSync(f, 'utf8').includes(base))
    if (!referencedElsewhere) orphanHtml.push(file)
  } else if (file.endsWith('.less')) {
    if (appReachable.has(file)) continue // shouldn't happen, .less never in JS seen set, kept for clarity
    if (styleTargets.has(file) || testStyleTargets.has(file)) continue
    orphanLess.push(file)
  }
}

console.log(`Boot+routes closure: ${appReachable.size} JS files reachable.`)
console.log(`Test closure: ${testSeen.size} JS files reachable from ${testFiles.length} test files.`)
console.log(`Total inventory: ${allFiles.length} files under js/ (.js/.html/.less, excluding assets/bundle).\n`)

function report (title, list) {
  console.log(`\n## ${title} (${list.length})`)
  for (const f of list) console.log(`  ${rel(f)}`)
}
report('Orphan .js files (unreachable from app AND tests)', orphanJs)
report('.js files reachable ONLY from tests (review, not auto-dead)', testOnlyJs)
report('Orphan .html files (no sibling .js, no cross-reference found)', orphanHtml)
report('Orphan .less files (never imported by any reachable .js)', orphanLess)

const unresolved = new Map(
  [...getUnresolvedSpecs()].filter(([spec]) => !spec.endsWith('?raw'))
)
// `?raw` imports are components loading their own sibling .html as a string
// (a real, deliberate pattern, already covered by the sibling-.html check
// above) -- not resolvable as a .js dep and not evidence of anything.
if (unresolved.size) {
  console.log(`\n## Unresolved relative specifiers found while walking closures (${unresolved.size})`)
  console.log('These are real misses in the closure walk, not orphan evidence -- investigate before trusting the lists above.')
  for (const [spec, files] of unresolved) {
    console.log(`  '${spec}' from: ${[...files].map(rel).join(', ')}`)
  }
}
