# Dead Code Audit

**Status: all 15 approval-list items removed and verified 2026-07-31 — see `CHANGELOG.md`.**

Audit date: 2026-07-31. Scope: `atlas/` app source (`js/**`, excluding `js/assets/bundle`), following the manual grep/reachability audits already documented in `CHANGELOG.md`/`MIGRATION_STATUS.md`/`NON_ESM_AUDIT.md`.

## Methodology

No TS, no knip/ts-prune/depcheck/madge in this repo. Two new scripts extend `build/check-registrations.js`'s existing primitives (Vite-alias-aware resolution, import-closure walking, `ko.components.register`/`commonUtils.build` registry, tag/string reference scanning — now shared via `build/lib/reachability.js`) to ask the *global* questions check-registrations.js doesn't:

- **`build/find-orphan-files.js`** — is this `.js`/`.html`/`.less` file reachable from any real entry point at all (boot closure + every `routes.js` + every non-module `<script src>` in `index.html`, walked to a fixpoint over both static and dynamic imports), or only from tests, or from nothing?
- **`build/find-dead-components.js`** — is this registered Knockout component name ever referenced (as a `<tag>`, a `componentName:`/`component: {name:}` literal, a bare quoted string anywhere in `js/`, or a same-file computed-dispatch pattern), or only by its own registration call?
- **`build/find-unused-exports.js`** (Phase 4, scoped to `js/utils`, `js/services`, `js/vendor/atlascharts`) — regex-based export enumeration + whole-repo identifier grep, not AST. Chosen deliberately: no TS, no dead-code tool already installed, and the review gate below makes false positives cheap.

**Named blind spot, disclosed rather than papered over**: none of these tools can follow a specifier or component name built from a runtime-computed string (`obj[computedKey]`, `import(` from a variable, `` `${prefix}-${suffix}` ``). Two real instances of exactly this pattern were found and correctly excluded during this audit (see "False positives found and excluded" below) — the same blind spot could exist elsewhere undetected. Every finding below was individually verified against this risk (repo-wide grep for the name/string, i18n/config collision check, test-only check, git history) before being listed as a candidate.

## Bonus finding (tooling gap, not dead code)

While building the reference scanner, found that `check-registrations.js`'s (and thus the reused `references()` helper's) assumption that a component's template shares its `.js` basename (`Foo.js` → `Foo.html`) is **wrong for the older PascalCase `cohortbuilder`/`cohortdefinitionviewer` components**, which load a differently-named template via `import view from './XTemplate.html?raw'` (e.g. `EndStrategyEditor.js` → `EndStrategyEditorTemplate.html`). The basename lookup silently finds nothing for ~30 such files, so their templates never get scanned for tag references. `build/lib/reachability.js`'s `references()` now resolves the real `?raw` import target first, falling back to basename — this fixed several false "dead" results below (see the cohortbuilder criteria components, excluded as live). **This same gap likely still exists unfixed in `check-registrations.js` itself** — it doesn't affect that script's correctness today (a false negative there just means it might under-count a route's own registrations, not report a wrong "missing" error), but is worth a follow-up fix for the same reason. Not included in the approval list below since it's a tooling fix, not a deletion — flagging separately in case you want it done alongside.

---

## A. Orphan files — high confidence

All verified: whole-repo grep (`js/`, `tests/`, `docker/`, `*.md`, `index.html`, `vite.config.js`, `Dockerfile`, `package.json`) for basename beyond definition, i18n/config string-collision check, `git log --follow` for history, no dynamic-construction pattern found referencing any of these names.

| File | Evidence | Notes |
|---|---|---|
| `js/Model.js` | 0 bytes. Empty file. | Last touched 2020-02-10 per `git log`. |
| `js/components/cohort-comparison-r-code.js` | Registers `cohort-comparison-r-code`; zero references anywhere (tag, string, or import) outside its own file/template. | Also a **dead component**, see B. |
| `js/components/cohort-comparison-multi-r-code.js` | Same as above, registers `cohort-comparison-multi-r-code`. | Also a **dead component**, see B. |
| `js/components/cohort-comparison-print-friendly.js` | Same as above, registers `cohort-comparison-print-friendly`. Last edited 2026-07-30 (AMD→ESM batch conversion), functionally untouched since. | Also a **dead component**, see B. A generic `print-friendly` string elsewhere in `cohort-definition-manager.js` is an unrelated feature (comment/log text), checked and ruled out as a false-positive collision. |
| `js/pages/estimation/inputTypes/TargetOutcomes.js` | Plain class, exported default, zero references anywhere including its own `pages/estimation/inputTypes/index.js` siblings. Superseded naming (`TargetComparatorOutcome(s).js`) exists and *is* used. | Last touched 2026-07-08 (ESM conversion pass), functionally untouched since. |
| `js/pages/feedback/const.js` | Exports unused `pageTitle`; sibling `index.js` hardcodes the nav title via `ko.i18n(...)` directly instead of importing this. | Pattern repeats identically 3x (see next 2 rows) — looks like a superseded per-page title convention. |
| `js/pages/jobs/const.js` | Same dead `pageTitle` pattern. | |
| `js/pages/tools/const.js` | Same dead `pageTitle` pattern. | |

## A2. Orphan stylesheets — high confidence

| File | Evidence |
|---|---|
| `js/components/conceptset/recommend.less` | Sibling `recommend.js` is live and reachable, but — unlike every neighboring component in the same directory (e.g. `conceptset-list.js` does `import './conceptset-list.less'`) — never imports this `.less` file. Dead CSS, not a dead file per se: styles defined here are never loaded into the app at all. |
| `js/pages/reusables/components/tabs/reusable-concept-sets.less` | Same pattern: sibling `.js` is live, never imports this `.less`. |

## B. Dead Knockout components — high confidence

Deliberately excludes anything in section A (redundant finding — a component whose file is a whole orphan is the same problem). These are components whose **file is reachable** (imported for a reason) but whose **registered name is never used** as a tag/string/dynamic-dispatch target anywhere.

| Component name | Registered by | Evidence |
|---|---|---|
| `drop-down-menu` | `js/components/DropDownMenu.js` | Two other files (`cohortbuilder/components/CriteriaGroup.js`, `characterizations/.../feature-analysis-view-edit.js`) do a bare `import 'components/DropDownMenu'` (side-effect-only, to trigger registration) apparently anticipating use, but `<drop-down-menu>` appears in neither file's own template nor anywhere else in `js/`. Removing the component also means removing those 2 dangling bare imports. |
| `generate-component` | `js/components/circe/main.js` (registers 2 components in one file — the sibling `concept-set-browser` **is** live and used widely, this one isn't) | `GenerateComponent.js`/`GenerateComponentTemplate.html`, untouched since a 2020-era structural refactor; `<generate-component>` appears nowhere. Removal is partial-file: delete `GenerateComponent.js` + its template + the 2-line registration block in `circe/main.js`, not the whole file. |
| `cohort-comparison-r-code`, `cohort-comparison-multi-r-code`, `cohort-comparison-print-friendly` | (see section A — same 3 files) | Cross-confirms the section A finding from the opposite direction. |

### Verified NOT dead (false positives this audit correctly excluded)

Listed for transparency, not for action — these are exactly the two blind-spot patterns the methodology above warns about, both real and both live:

- **`temporal-covar-settings-editor`** (`js/components/featureextraction/components/temporal-covariate-settings-editor.js`) — initially flagged (2 dangling bare imports, no tag found), but this one is genuinely ambiguous rather than confirmed dead: unlike `drop-down-menu`, it has no sibling `covar-settings-editor`-style usage pattern to compare against, and the surrounding "temporal covariates" feature area is plausible but not confirmed live. **Left out of the approval list below** — recommend a manual product-level check (does the Prediction UI currently expose temporal covariate settings?) rather than a static-analysis verdict either way.
- **Cohortbuilder/cohortdefinitionviewer criteria components** (`numeric-range`, `date-range`, `end-strategy-editor`, `date-offset-strategy`, `custom-era-strategy`, `concept-list`, `conceptset-quickview`, ~25 more) — all initially flagged, all false positives caused by the `?raw`-template-basename tooling gap described above (their templates use `*Template.html` naming, so the tag scanner was reading the wrong/no file). Confirmed live once the reference scanner was fixed to follow the actual `?raw` import target.
- **Chart-type components with no-hyphen names** (`donut`, `histogram`, `atlasline`, `treemap`, `trellisline`, `panel`, `weekdays`, etc.) — all initially flagged, all false positives caused by `check-registrations.js`'s `TAG_RE` requiring a hyphen in the tag name (correct for HTML5 custom-element convention, wrong for this app, which has several single-word component names). Confirmed live (e.g. `<donut>` in `reportDrilldown.html`) once checked with a per-name tag pattern instead.
- **Page-level components** (`home`, `vocabulary`, `cca-manager`, ~30 more) and **criteria-type lookup results** (`condition-occurrence-criteria` etc.) — all initially flagged, all false positives caused by dispatch via `router.setCurrentView('name')` or a type→name lookup function (`js/components/cohortbuilder/utils.js`) rather than a template tag. Confirmed live via whole-repo quoted-string grep once tag-only matching was broadened.

## C. Unused exports — high confidence for 4, informational-only for the rest

Scoped to `js/utils`, `js/services`, `js/vendor/atlascharts` per the plan (non-component utility modules, matching how `ohdsi.util.js` — 92% dead — was found previously). 14 initial candidates; verified individually (internal same-file call check, since a function can be "never imported externally" yet fully alive via internal use, e.g. through a `decorateComponent`-style wiring pattern this codebase uses in `Permission.js`/`Tags.js`).

**Genuinely dead — zero calls anywhere, including internally:**

| File | Export | Evidence |
|---|---|---|
| `js/utils/CommonUtils.js` | `renderHierarchyLink` | Defined + listed in both `export {}` and `export default {}`; zero calls anywhere, including within the file itself. |
| `js/utils/CommonUtils.js` | `highlightRow` | Same. |
| `js/utils/NativeCompat.js` | `xor` | Same. (A `_.xor` lodash bug fixed elsewhere in `multi-select.js`, per `MIGRATION_STATUS.md`, is unrelated — checked and ruled out as a false lead; that call still uses lodash's `xor`, not this one.) |
| `js/services/Tags.js` | `getTag` | Same. |

**Not dead — exported but only used internally (informational only, not a removal candidate):** `getConceptLinkClass`, `commaDelimitedListToArray` (also unit-tested), `compileRoute` (also unit-tested), `getLocale`, `loadEntityAccessList`, `grantEntityAccess`, `revokeEntityAccess`, `loadRoleSuggestions`, `loadTagsSuggestions`. Each is called from elsewhere in its own file (directly, or via a `decorateComponent`-style attach-to-viewmodel pattern), so the underlying code executes — only the *export statement* is arguably unnecessary. Not included in the approval list; flagged for awareness only, since trimming an export that's still internally live is export-hygiene, not dead-code removal.

**Public API surface, not app-internal — do not remove:** `js/services/PluginRegistry.js` :: `REGISTER_PLUGIN_EVENT`. This constant names a `CustomEvent` (`'registerAtlasPlugin'`) that `document.addEventListener`s inside the file — by design, the *consumer* is a plugin author's code running outside this repo (`document.dispatchEvent(new CustomEvent(REGISTER_PLUGIN_EVENT, ...))` from an unrelated script), so "zero references in this codebase" is the *expected* state for a public extension point, not evidence of dead code. Static analysis cannot resolve this either way — noted so it isn't mistakenly flagged again by future automated runs.

## D. Dead branches — sampled, not exhaustive

**High confidence, matches an already-identified target:**

| File | Pattern | Evidence |
|---|---|---|
| `js/extensions/bindings/knockout.selectOnFocus.js` | UMD wrapper: `typeof define === 'function' && define.amd` branch, else `factory(ko)` | Already flagged in `NON_ESM_AUDIT.md` as "safe, low-effort cleanup" — confirmed still present, not yet done. No global `define` exists in this app (no AMD loader), so the AMD branch never executes; the file already has a real ESM `import ko from 'knockout'` at the top, so the whole factory-wrapper is redundant indirection. |

**Found, lower priority — vendor file, recommend leaving as-is:**

| File | Pattern | Evidence |
|---|---|---|
| `js/assets/jqueryui/jquery.ddslick.js` | Same UMD `typeof define === 'function' && define.amd` dead branch | Also confirmed dead for the same reason. Per `CLAUDE.md`/`NON_ESM_AUDIT.md`, this is a third-party vendor file "kept in active use" as-is, not rewritten — hand-editing vendored source makes future upstream diffing harder for a purely cosmetic win. **Not included in the approval list**; noted for completeness only. |

**Checked and clean:** `process.env.NODE_ENV` conditionals — the only 2 in the app (`js/main.js` debug logging, `js/config/app.js`'s `enableTermsAndConditions`) are both already documented as intentional in `MIGRATION_STATUS.md`; no new/undocumented ones found. `npm run lint`'s `no-unreachable`/`no-fallthrough` (neostandard) — clean, no findings.

**Not exhaustively pursued:** a grep for commented-out code blocks turned up ~50 hits scattered across the codebase (mostly 1-3 line fragments in `expressionCartoonBinding.js`, `demographic-report.js`, `conceptset/import.js`, `atlascharts/*.js`, and others). These are individually low-risk/low-value and not concentrated enough to justify a full pass in this audit — recommend treating as a separate, lower-priority follow-up if wanted, rather than bundling here.

---

## Approval list (only these are proposed for removal)

1. `js/Model.js`
2. `js/components/cohort-comparison-r-code.js` (+ its `.html` + registration)
3. `js/components/cohort-comparison-multi-r-code.js` (+ its `.html` + registration)
4. `js/components/cohort-comparison-print-friendly.js` (+ its `.html` + registration)
5. `js/pages/estimation/inputTypes/TargetOutcomes.js`
6. `js/pages/feedback/const.js`
7. `js/pages/jobs/const.js`
8. `js/pages/tools/const.js`
9. `js/components/conceptset/recommend.less`
10. `js/pages/reusables/components/tabs/reusable-concept-sets.less`
11. `js/components/DropDownMenu.js` (+ its `.html`/`.less` if present + the 2 dangling bare imports in `CriteriaGroup.js` and `feature-analysis-view-edit.js`)
12. `js/components/circe/components/GenerateComponent.js` + `GenerateComponentTemplate.html` + the `generate-component` registration lines in `js/components/circe/main.js` (keep the rest of that file — `concept-set-browser` is live)
13. `js/utils/CommonUtils.js` :: `renderHierarchyLink`, `highlightRow` (remove the functions and their entries in both export statements)
14. `js/utils/NativeCompat.js` :: `xor`
15. `js/services/Tags.js` :: `getTag`

Everything else in this document (the false-positive list, the "not dead" export list, `REGISTER_PLUGIN_EVENT`, `temporal-covar-settings-editor`, the vendor UMD branch, the commented-code sample) is informational — **not** proposed for action here.

Please review and mark up which of the 15 items above you approve. Once approved, removal proceeds in small batches with `npm run lint` / `npm test` / `npm run check:registrations` / `npm run build:dev` / `npm run build:docker` / a `run-atlas` smoke pass after each batch, and a `CHANGELOG.md` entry per logically-distinct removal.
