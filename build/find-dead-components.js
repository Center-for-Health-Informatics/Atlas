// Phase 2 of the dead-code audit: the mirror of check-registrations.js.
// check-registrations.js asks "does this route register what it
// references"; this asks "is this registered component ever referenced by
// anything, anywhere" -- a registered name with zero non-self references is
// a Knockout component nothing ever puts on screen.
//
// Deliberately excludes anything find-orphan-files.js already flagged as a
// whole orphan file -- a component whose file is unreachable is the same
// finding surfacing twice. This script only reports the non-redundant case:
// the file is reachable (imported for some reason) but the component name
// itself is never used as a tag/string anywhere.
//
// Usage: node build/find-dead-components.js
import fs from 'node:fs'
import { js, rel, walk, buildRegistry, references } from './lib/reachability.js'

const allFiles = walk(js(''))
const registry = buildRegistry(allFiles)
const tagRefs = references(allFiles, registry) // <tag> / componentName: / badge convention

// tagRefs alone (check-registrations.js's regex trio) has a large false-positive
// rate at whole-app scope: page-level components are dispatched by
// `router.setCurrentView('name')`, not a tag, and several component names
// (e.g. the cohortbuilder criteria components) are only ever produced by a
// criteria-type -> name lookup function (js/components/cohortbuilder/utils.js),
// never written as a literal `<tag>` or `componentName:` anywhere. Both are
// real, deliberate patterns, not bugs -- so the reference check here is
// broadened to "does this exact quoted string literal appear anywhere in
// js/ outside the file that registers it," which catches both in addition
// to the tag/componentName forms.
function walkHtml (dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${entry.name}`
    if (entry.isDirectory()) {
      if (!p.includes('assets/bundle')) walkHtml(p, out)
    } else if (entry.name.endsWith('.html')) {
      out.push(p)
    }
  }
  return out
}
const allHtmlFiles = walkHtml(js(''))
const fileText = new Map(
  [...allFiles, ...allHtmlFiles].map(f => [f, fs.readFileSync(f, 'utf8')])
)
function quotedLiteralRefs (name) {
  // Quoted string OR an opening tag -- check-registrations.js's TAG_RE
  // requires a hyphen (`[a-z][a-z0-9]*(?:-[a-z0-9]+)+`), which is right for
  // HTML5 custom-element conventions but wrong here: this app has several
  // single-word component names (`donut`, `panel`, `weekdays`, `atlasline`)
  // that Knockout happily registers and templates happily use as `<donut>`.
  // A hyphen-only tag pattern silently never matches those, so build the tag
  // check from the actual registered name instead of a generic shape.
  const re = new RegExp(`['"]${name}['"]|<${name}[\\s>/]`)
  const hits = []
  for (const [file, text] of fileText) {
    if (re.test(text)) hits.push(file)
  }
  return hits
}

// A same-file hit isn't automatically a false "used" signal to discard, nor
// automatically proof of life -- e.g. EndStrategyEditor.js both registers
// 'date-offset-strategy' AND computes that literal as the value it feeds its
// own template's dynamic `component: {name: ...}` binding, which is a real,
// live dispatch entirely within one file. Distinguish the two by counting:
// the registration call itself accounts for exactly one occurrence of the
// quoted name/tag pattern, so a second occurrence in the same file is a real
// additional reference, not noise.
function selfOccurrences (name, file) {
  const re = new RegExp(`['"]${name}['"]|<${name}[\\s>/]`, 'g')
  return (fileText.get(file).match(re) || []).length
}

const candidates = []
for (const [name, file] of registry) {
  const literalHits = quotedLiteralRefs(name).filter(f => f !== file)
  const tagRef = tagRefs.get(name)
  const hasExternalTagRef = tagRef && tagRef !== file
  const extraSelfUse = selfOccurrences(name, file) > 1
  if (literalHits.length === 0 && !hasExternalTagRef && !extraSelfUse) {
    candidates.push({
      name,
      file,
      reason: 'no reference (tag, componentName, or quoted string) found beyond the registration call itself'
    })
  }
}

console.log(`Registry: ${registry.size} components registered across ${allFiles.length} files.`)
console.log(`\n## Dead components -- registered but never referenced (${candidates.length})`)
for (const { name, file, reason } of candidates) {
  console.log(`  '${name}'  registered by ${rel(file)}  (${reason})`)
}
