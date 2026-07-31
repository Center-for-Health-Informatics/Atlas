// Phase 4 of the dead-code audit: exported functions/consts/classes in
// non-component utility modules (js/utils, js/services, js/vendor/atlascharts)
// with zero references anywhere else in the app. Regex-based, not AST --
// see DEAD_CODE_AUDIT.md for why that tradeoff was made deliberately.
//
// Known, disclosed blind spot: `import * as ns from './x'; ns[computedKey]`
// defeats static grep. Namespace-import files are lower confidence, not
// silently skipped -- see the report.
//
// Usage: node build/find-unused-exports.js
import fs from 'node:fs'
import path from 'node:path'
import { js, rel, walk } from './lib/reachability.js'

const SCOPE_DIRS = ['utils', 'services', 'vendor/atlascharts']
const scopeFiles = SCOPE_DIRS.flatMap(d => walk(js(d)))
const allFiles = walk(js(''))
const allText = new Map(allFiles.map(f => [f, fs.readFileSync(f, 'utf8')]))

const EXPORT_FN_RE = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g
const EXPORT_CONST_RE = /export\s+const\s+([A-Za-z_$][\w$]*)/g
const EXPORT_CLASS_RE = /export\s+class\s+([A-Za-z_$][\w$]*)/g
const EXPORT_LIST_RE = /export\s*\{([^}]+)\}(?!\s*from)/g
const NAMESPACE_IMPORT_RE = /import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g

function exportsOf (file) {
  const text = allText.get(file)
  const names = new Set()
  let m
  EXPORT_FN_RE.lastIndex = 0; while ((m = EXPORT_FN_RE.exec(text))) names.add(m[1])
  EXPORT_CONST_RE.lastIndex = 0; while ((m = EXPORT_CONST_RE.exec(text))) names.add(m[1])
  EXPORT_CLASS_RE.lastIndex = 0; while ((m = EXPORT_CLASS_RE.exec(text))) names.add(m[1])
  EXPORT_LIST_RE.lastIndex = 0
  while ((m = EXPORT_LIST_RE.exec(text))) {
    for (const part of m[1].split(',')) {
      const piece = part.trim()
      if (!piece) continue
      const asMatch = piece.match(/^\S+\s+as\s+(\S+)$/)
      names.add(asMatch ? asMatch[1] : piece)
    }
  }
  return names
}

// Files imported via `import * as ns from '...'` anywhere -- their exports
// get a lower-confidence label since `ns[computedKey]` is invisible to grep.
const namespaceImported = new Set()
for (const [, text] of allText) {
  let m
  NAMESPACE_IMPORT_RE.lastIndex = 0
  while ((m = NAMESPACE_IMPORT_RE.exec(text))) namespaceImported.add(m[2])
}

const candidates = []
for (const file of scopeFiles) {
  const names = exportsOf(file)
  for (const name of names) {
    if (name === 'default') continue
    const re = new RegExp(`\\b${name}\\b`)
    const hits = []
    for (const [other, text] of allText) {
      if (other === file) continue
      if (re.test(text)) hits.push(other)
    }
    if (hits.length === 0) {
      const base = path.basename(file, '.js')
      candidates.push({
        name,
        file,
        lowConfidence: namespaceImported.has(`./${base}`) || [...namespaceImported].some(spec => file.endsWith(spec.replace(/^\.\//, '') + '.js'))
      })
    }
  }
}

console.log(`Scanned ${scopeFiles.length} files under ${SCOPE_DIRS.join(', ')}.`)
console.log(`\n## Unused exports (${candidates.length})`)
for (const { name, file, lowConfidence } of candidates) {
  console.log(`  ${rel(file)} :: ${name}${lowConfidence ? '  [LOW CONFIDENCE -- file has a namespace importer somewhere]' : ''}`)
}
