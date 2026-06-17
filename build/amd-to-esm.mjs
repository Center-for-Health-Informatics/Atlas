#!/usr/bin/env node
/**
 * AMD → ESM batch converter
 *
 * Converts define([deps], factory) and variants to ES module import/export.
 * Run from atlas/:  node build/amd-to-esm.mjs [--dry-run] [file...]
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { dirname, resolve, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const jsDir = resolve(rootDir, 'js')

const DRY_RUN = process.argv.includes('--dry-run')
const TARGET_FILES = process.argv.slice(2).filter(a => !a.startsWith('-'))

// ─── Skip list ────────────────────────────────────────────────────────────────

const SKIP_RE = [
  /\/js\/require\.js$/,
  /\/js\/settings\.js$/,
  /\/js\/main\.js$/,
  /\/js\/extensions\/plugins\//,
  /\/js\/assets\//,
  /\.min\.js$/,
]

function shouldSkip (path) {
  return SKIP_RE.some(r => r.test(path))
}

// ─── Bracket matching (string/comment-aware) ──────────────────────────────────

function findClose (src, pos) {
  const OPEN = src[pos]
  const CLOSE = { '[': ']', '{': '}', '(': ')' }[OPEN]
  if (!CLOSE) return -1
  let depth = 0, i = pos
  while (i < src.length) {
    const ch = src[i]
    if (ch === '"' || ch === "'") {
      const q = ch; i++
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue }
        if (src[i] === q) break
        i++
      }
    } else if (ch === '`') {
      i++
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue }
        if (src[i] === '`') break
        if (src[i] === '$' && src[i + 1] === '{') {
          const e = findClose(src, i + 1); if (e >= 0) i = e
        }
        i++
      }
    } else if (src.slice(i, i + 2) === '//') {
      while (i < src.length && src[i] !== '\n') i++
    } else if (src.slice(i, i + 2) === '/*') {
      const e = src.indexOf('*/', i + 2); if (e < 0) return -1; i = e + 1
    } else if (ch === OPEN) { depth++ }
    else if (ch === CLOSE) { if (--depth === 0) return i }
    i++
  }
  return -1
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseDeps (src, pos) {
  const end = findClose(src, pos)
  if (end < 0) return null
  const inner = src.slice(pos + 1, end)
  const deps = []; const re = /['"]([^'"]+)['"]/g; let m
  while ((m = re.exec(inner))) deps.push(m[1])
  return { deps, end }
}

function parseParams (src, pos) {
  const end = findClose(src, pos)
  if (end < 0) return null
  const inner = src.slice(pos + 1, end).trim()
  if (!inner) return { params: [], end }
  const params = []; let depth = 0, cur = ''
  for (const ch of inner) {
    if ('{(['.includes(ch)) { depth++; cur += ch }
    else if ('})]'.includes(ch)) { depth--; cur += ch }
    else if (ch === ',' && depth === 0) { params.push(cur.trim()); cur = '' }
    else cur += ch
  }
  if (cur.trim()) params.push(cur.trim())
  return { params, end }
}

// ─── Import generator ─────────────────────────────────────────────────────────

function makeImport (dep, param) {
  // AMD CJS-compat phantom deps — not real modules
  if (dep === 'require' || dep === 'exports' || dep === 'module') return null

  if (dep.startsWith('text!')) {
    const p = dep.slice(5) + '?raw'
    return (param && param !== '_') ? `import ${param} from '${p}'` : `import '${p}'`
  }
  if (dep.startsWith('less!')) {
    const raw = dep.slice(5)
    const p = (raw.startsWith('.') || raw.startsWith('/')) ? raw : './' + raw
    return `import '${p}'`
  }
  if (dep.startsWith('css!')) {
    const raw = dep.slice(4)
    const p = (raw.startsWith('.') || raw.startsWith('/')) ? raw : './' + raw
    return `import '${p}'`
  }
  if (dep.startsWith('optional!')) {
    const mod = dep.slice(9)
    if (param && param !== '_') return `import ${param} from '${mod}' // was optional!`
    return `import '${mod}' // was optional!`
  }
  if (!param) return `import '${dep}'`
  return `import ${param} from '${dep}'`
}

// ─── Body helpers ─────────────────────────────────────────────────────────────

// Remove 'use strict' directive (implicit in ESM)
function removeUseStrict (body) {
  return body.replace(/^[ \t]*('use strict'|"use strict")\s*;?\s*\n?/gm, '')
}

// Dedent body: remove the minimum leading whitespace from all non-empty lines
function dedent (body) {
  const lines = body.split('\n')
  const nonEmpty = lines.filter(l => l.trim())
  if (!nonEmpty.length) return body
  const minIndent = Math.min(...nonEmpty.map(l => l.match(/^(\s*)/)[1].length))
  if (!minIndent) return body
  return lines.map(l => l.slice(minIndent)).join('\n')
}

// Find last top-level `return ` (depth-0 search)
function findLastReturn (body) {
  let depth = 0, last = -1, i = 0
  while (i < body.length) {
    const ch = body[i]
    if (ch === '"' || ch === "'") {
      const q = ch; i++
      while (i < body.length) { if (body[i] === '\\') { i += 2; continue } if (body[i] === q) break; i++ }
    } else if (ch === '`') {
      i++
      while (i < body.length) { if (body[i] === '\\') { i += 2; continue } if (body[i] === '`') break; i++ }
    } else if (body.slice(i, i + 2) === '//') {
      while (i < body.length && body[i] !== '\n') i++
    } else if (body.slice(i, i + 2) === '/*') {
      const e = body.indexOf('*/', i + 2); if (e >= 0) i = e + 1
    } else if ('{(['.includes(ch)) depth++
    else if ('})]'.includes(ch)) depth--
    else if (depth === 0 && body.slice(i, i + 7) === 'return ') { last = i }
    i++
  }
  return last
}

function convertLastReturn (body) {
  const pos = findLastReturn(body)
  if (pos < 0) return body
  const before = body.slice(0, pos)
  let after = body.slice(pos + 7).trimEnd()
  if (after.endsWith(';')) after = after.slice(0, -1)
  return before + 'export default ' + after + '\n'
}

// ─── Inline require() → imports ───────────────────────────────────────────────

function extractInlineRequires (body) {
  const imports = []
  const result = body.replace(
    /^([ \t]*)(?:(const|let|var)\s+(\{[^}]+\}|[\w$]+)\s*=\s*)?require\(['"]([^'"]+)['"]\)(?:\.\w+)?\s*;?\s*\n/gm,
    (match, indent, decl, param, dep) => {
      imports.push(makeImport(dep, param || null))
      return ''
    }
  )
  return { imports, body: result }
}

// Convert dynamic require(['dep'], cb) → import('dep').then(cb)
// Only handles the single-dep case reliably; multi-dep gets a TODO
function convertDynamicRequires (body) {
  let result = ''
  let i = 0
  while (i < body.length) {
    // Look for require([ at current position
    if (body.slice(i, i + 9) === 'require([') {
      const arrStart = i + 8
      const arrEnd = findClose(body, arrStart)
      if (arrEnd < 0) { result += body[i++]; continue }

      const depsRes = parseDeps(body, arrStart)
      if (!depsRes) { result += body[i++]; continue }

      // Find comma after ]
      let j = arrEnd + 1
      while (j < body.length && /[\s,]/.test(body[j])) j++

      // Find callback: function(...) or (...)=>
      let cbParams = [], bodyStart = -1, bodyEnd = -1
      if (body.slice(j).startsWith('function')) {
        j += 8
        while (j < body.length && /\s/.test(body[j])) j++
        if (body[j] === '(') {
          const p = parseParams(body, j); if (!p) { result += body[i++]; continue }
          cbParams = p.params; j = p.end + 1
        }
      } else if (body[j] === '(') {
        const p = parseParams(body, j); if (!p) { result += body[i++]; continue }
        cbParams = p.params; j = p.end + 1
        while (j < body.length && /\s/.test(body[j])) j++
        if (body.slice(j, j + 2) === '=>') j += 2
      } else {
        result += body[i++]; continue
      }

      while (j < body.length && /\s/.test(body[j])) j++
      if (body[j] !== '{') { result += body[i++]; continue }

      bodyStart = j
      bodyEnd = findClose(body, bodyStart)
      if (bodyEnd < 0) { result += body[i++]; continue }

      // Skip closing ) of require call
      let k = bodyEnd + 1
      while (k < body.length && /\s/.test(body[k])) k++
      if (body[k] === ')') k++

      const cbBody = body.slice(bodyStart, bodyEnd + 1)
      const deps = depsRes.deps

      if (deps.length === 0) {
        result += `Promise.resolve().then(() => ${cbBody})`
      } else if (deps.length === 1) {
        result += `import('${deps[0]}').then(() => ${cbBody})`
      } else {
        const allImports = deps.map(d => `import('${d}')`).join(', ')
        result += `Promise.all([${allImports}]).then(() => ${cbBody})`
      }
      i = k
    } else {
      result += body[i++]
    }
  }
  return result
}

// ─── Factory parser ───────────────────────────────────────────────────────────

function parseFactory (src, pos) {
  let params = []

  // skip optional name after 'function'
  if (src.slice(pos).startsWith('function')) {
    pos += 8
    while (pos < src.length && src[pos] !== '(' && /[\s\w$]/.test(src[pos])) pos++
  }

  if (src[pos] !== '(') return {}
  const p = parseParams(src, pos)
  if (!p) return {}
  params = p.params; pos = p.end + 1

  // skip whitespace and optional '=>'
  while (pos < src.length && /\s/.test(src[pos])) pos++
  if (src.slice(pos, pos + 2) === '=>') pos += 2
  while (pos < src.length && /\s/.test(src[pos])) pos++

  if (src[pos] !== '{') return {}
  const bodyEnd = findClose(src, pos)
  if (bodyEnd < 0) return {}

  return { params, body: src.slice(pos + 1, bodyEnd), pos: bodyEnd + 1 }
}

// ─── Strip leading comments so define() can be found ─────────────────────────

function stripLeadingComments (src) {
  let i = 0
  while (i < src.length) {
    // skip whitespace
    while (i < src.length && /\s/.test(src[i])) i++
    if (src.slice(i, i + 2) === '//') {
      while (i < src.length && src[i] !== '\n') i++
    } else if (src.slice(i, i + 2) === '/*') {
      const end = src.indexOf('*/', i + 2)
      if (end < 0) break
      i = end + 2
    } else if (src.slice(i, i + 12) === "'use strict'" || src.slice(i, i + 12) === '"use strict"') {
      i += 12
      if (src[i] === ';') i++
    } else break
  }
  return src.slice(i)
}

// ─── Main converter ───────────────────────────────────────────────────────────

function convert (srcOrig) {
  const stripped = stripLeadingComments(srcOrig)
  // Preserve leading comments but not 'use strict' (implicit in ESM)
  const rawLeading = srcOrig.slice(0, srcOrig.length - stripped.length)
  const leadingComments = rawLeading.replace(/'use strict'[;\s]*/g, '').replace(/"use strict"[;\s]*/g, '')
  const src = stripped

  if (!src.startsWith('define(')) return null

  let pos = 7 // after 'define('
  while (pos < src.length && /\s/.test(src[pos])) pos++

  const ch = src[pos]

  // ── Object shorthand: define({...}) ──────────────────────────────────────
  if (ch === '{') {
    const end = findClose(src, pos)
    if (end < 0) return null
    return leadingComments + `export default ${src.slice(pos, end + 1)}\n`
  }

  // ── Array deps: define([...], factory) ───────────────────────────────────
  if (ch === '[') {
    const dr = parseDeps(src, pos)
    if (!dr) return null
    const { deps, end: depsEnd } = dr

    let fPos = depsEnd + 1
    while (fPos < src.length && /[\s,]/.test(src[fPos])) fPos++

    const { params = [], body } = parseFactory(src, fPos)
    if (body === undefined) return null

    const rawBody = removeUseStrict(dedent(body))
    const depImports = deps.map((dep, i) => makeImport(dep, params[i] || null))
    // Also lift any inline require() calls from the body (AMD hybrid pattern)
    const { imports: bodyImports, body: cleanBody } = extractInlineRequires(rawBody)
    const allImports = dedup([...depImports, ...bodyImports])
    const converted = convertLastReturn(cleanBody.trimEnd()) + '\n'
    return leadingComments + formatOutput(allImports, converted)
  }

  // ── No-deps or inline-require: define(fn) ────────────────────────────────
  if (src.slice(pos).startsWith('function') || src[pos] === '(') {
    const { params = [], body } = parseFactory(src, pos)
    if (body === undefined) return null

    const rawBody = removeUseStrict(dedent(body))

    // Extract inline require() calls from body (works for both require-param and plain no-deps)
    const { imports: bodyImports, body: stripped } = extractInlineRequires(rawBody)
    const dynamicConverted = convertDynamicRequires(stripped)
    const withExport = convertLastReturn(dynamicConverted.trimEnd()) + '\n'
    return leadingComments + formatOutput(dedup(bodyImports), withExport)
  }

  return null
}

function dedup (imports) {
  return [...new Set(imports.filter(Boolean))]
}

function formatOutput (imports, body) {
  const block = imports.filter(Boolean).join('\n')
  const trimmedBody = body.trimStart()
  return block ? block + '\n\n' + trimmedBody : trimmedBody
}

// ─── File discovery ───────────────────────────────────────────────────────────

function getAllJsFiles (dir) {
  return execSync(`find "${dir}" -name "*.js" -not -path "*/node_modules/*" -not -path "*/bundle/*"`)
    .toString().trim().split('\n').filter(Boolean)
}

// ─── Driver ───────────────────────────────────────────────────────────────────

const files = TARGET_FILES.length > 0
  ? TARGET_FILES.map(f => resolve(process.cwd(), f))
  : getAllJsFiles(jsDir)

let converted = 0, skipped = 0, alreadyEsm = 0
const failed = []

for (const file of files) {
  if (shouldSkip(file)) { skipped++; continue }

  let src
  try { src = readFileSync(file, 'utf8') } catch { failed.push(file + ' (read error)'); continue }

  if (!stripLeadingComments(src).startsWith('define(')) { alreadyEsm++; continue }

  const result = convert(src)
  if (result === null) { failed.push(file); continue }

  if (DRY_RUN) {
    console.log(`\n── ${relative(rootDir, file)} ──`)
    console.log(result)
    console.log('───')
  } else {
    try { writeFileSync(file, result) } catch { failed.push(file + ' (write error)'); continue }
  }
  converted++
}

console.log(`\n✓ converted:   ${converted}`)
console.log(`  skipped:     ${skipped}`)
console.log(`  already ESM: ${alreadyEsm}`)
if (failed.length) {
  console.log(`\n✗ failed (${failed.length}):`)
  failed.forEach(f => console.log('  ' + relative(rootDir, f)))
}
