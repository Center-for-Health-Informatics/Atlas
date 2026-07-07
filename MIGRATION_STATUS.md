# AMD → ESM Migration Status

There's no single doc that's tracked this as it happened — the real history lives across git log messages, code comments, and (until now) a Claude memory file nobody else could see. This is an attempt to consolidate it as of 2026-07-07. Verify against current code/git log before trusting specifics — this will drift.

## Where things stand

**Source conversion: essentially done.** Of ~785 JS files under `js/`, only 9 non-build-output files still use `define(...)` — and all 9 are third-party/vendor code, not app source:
- RequireJS plugin shims: `js/extensions/plugins/{text,css.min,less,optional}.js`
- Vendor UMD libs: `jquery.ddslick.js`, `d3.slider.js`, `d3-scale-chromatic.1.3.0.min.js`, `jnj.chart.js`
- `js/extensions/bindings/knockout.selectOnFocus.js`

Git history for this: `3ab53419` (phases 0 & 1), `a7cd1b94` (phase 2: batch-converted 620+ files), `5c76a6a9` ("mid AMD→ESM migration"), plus assorted individual bug fixes since.

**Dev server: works.** `npm run dev` runs Vite at whatever host/port is configured (see `vite.config.mjs`), proxying `/WebAPI` to the webapi container. App boots, renders nav, and — as of this session — Home, Vocabulary Search, Concept Set creation/editing, and Cohort Pathways have all been smoke-tested and had bugs fixed (see `CHANGELOG.md`). Not yet smoke-tested: Cohort Definition builder, Estimation, Prediction, full Characterizations flows. Data Sources dashboards are expected to be empty until ACHILLES has been run against the Synthea CDM.

**Production build: NOT migrated — currently broken.** This is the biggest gap and easy to miss:
- `npm run build` / `build:dev` / `build:docker` still shell out to `build/optimize.js`, which uses the old RequireJS optimizer (`r.js`) + Babel + Terser to produce a single `js/assets/bundle/bundle.js`.
- Tested this directly: it **exits 0 with no errors**, but the resulting bundle is ~9K lines and only contains 3 `define()`-wrapped modules — i.e. it silently fails to bundle the ESM app source (r.js can't parse `import`/`export`) and produces a small, non-functional bundle without telling you.
- Since `build:docker` calls the same broken path, **a Docker image built today would ship a broken frontend with no build-time error to catch it.**
- Meanwhile, plain `vite build` (not currently wired into any npm script) works correctly and produces a full, chunked, working bundle. The fix here is straightforward: point `build`/`build:dev`/`build:docker` at `vite build` instead of `build/optimize.js`, then retire the old script.

**Tests: fixed — now on Node's built-in test runner, 18/18 passing.** Jest is gone (`jest.config.js` deleted, `jest` dropped from `package.json`). It had depended on a RequireJS shim (`requireAmd()`/`requirejsInstance`) to load AMD-style modules, which stopped working once app source moved to ESM (every test failed with `SyntaxError: Unexpected token 'export'`). `npm test` now runs `node --import ./tests/register-hooks.mjs --test`, and all 5 existing test files (`AutoBind`, `BemHelper`, `CommonUtils`, `DataTypeConverterUtils`, `ExceptionUtils`) were ported to plain ESM imports + `node:assert/strict`. `package.json` now declares `"type": "module"` (verified this doesn't break `vite build` or `vite --config`). The one module-resolution wrinkle — `CommonUtils.js` importing Vite-only bare aliases (`appConfig`, `atlas-state`, etc.) that plain Node can't resolve — is handled by a small custom resolve hook (`tests/hooks.mjs`, registered via `tests/register-hooks.mjs`) that redirects those specifiers to stub files in `tests/stubs/`. See `CHANGELOG.md` (2026-07-07) for details.

**Docs: `atlas/CLAUDE.md` is stale.** It was last edited at the "initial reformatting to neostandard" commit (`5b3d0360`), which is *before* all the AMD→ESM migration commits. It currently describes the codebase as pure AMD/RequireJS with "no dev server" — both no longer true. Worth updating so future sessions (Claude or otherwise) aren't working from an inaccurate architecture description.

**Lint:** `npm run lint` runs (doesn't crash) but currently reports ~4100 problems, the large majority auto-fixable stylistic issues from the neostandard reformat, plus a handful of real ones (e.g. undefined globals like `Prism`, `no-prototype-builtins` misuse). Hasn't been cleaned up post-reformat.

**Debug scaffolding still in place, meant to be temporary:**
- `js/main.js` — sequential `log()` calls that write each import step to `console.log` and `document.title`, meant to help pinpoint which import broke during the migration.
- `index.html:5` — a global `window.addEventListener('error', ...)` handler that also writes to `document.title`, same purpose.

Both were left in deliberately to make module-load failures visible during the migration. Worth removing once things feel stable enough not to need them — they're currently still present.

**`vite.config.mjs` — "Phase 3" referenced but not defined anywhere else.** A comment there reads `// AMD plugin aliases (kept for transition; removed after Phase 3)`, aliasing `text!`, `less!`, `css!` (RequireJS plugin prefixes) to their Vite equivalents. No other doc defines what "Phase 3" consists of — reasonable guess, given everything else above, is that it's: (1) switch the build scripts to `vite build`, (2) drop the old RequireJS-based build/test tooling, (3) drop these transitional aliases once nothing references the old `text!`/`less!`/`css!` prefixes, (4) remove the debug scaffolding above.

## Suggested next steps, roughly in order

1. ~~Fix the test harness to load ESM instead of `requireAmd`~~ — done 2026-07-07: dropped Jest for `node --test`, all 18 tests passing.
2. Repoint `build` / `build:dev` / `build:docker` npm scripts at `vite build` (already proven to work); retire `build/optimize.js` and the RequireJS/Babel/Terser toolchain it drives. (Note: `requirejs` the npm package is still needed until this happens — `build/optimize.js` depends on it — even though the test suite no longer does.)
3. Smoke-test the remaining major flows (Cohort Definitions, Estimation, Prediction, Characterizations).
4. Update `atlas/CLAUDE.md` to describe the ESM/Vite architecture instead of the old AMD one.
5. Remove the debug scaffolding in `main.js` / `index.html` once (2)-(3) give enough confidence.
6. Clean up lint findings, drop the transitional AMD-plugin aliases in `vite.config.mjs`, drop the now-unused `requirejs` dependency from `package.json` (once step 2 is done).
