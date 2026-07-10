# Future Considerations

Running list of things worth revisiting. Not bugs blocking current work — just noted for later.

## UI/UX

- **Checkbox contrast** — the `.fa-check` checkbox glyph (used throughout search results, concept set editors, etc.) renders an unchecked state as `color: #eee` on white, which is easy to mistake for a checked/greyed-out box at a glance. Working as designed (upstream Atlas CSS in `js/styles/atlas.css`), but worth reconsidering — e.g. an actual empty box when unchecked, filled only when checked, would be less ambiguous.

- **No duplicate-concept guard in concept sets** — Atlas has never validated or deduped concept IDs within a concept set's item list (`components/conceptset/utils.js` `addItemsToConceptSet` just pushes). You can add the same concept twice — once by mistake (a related checkbox-clearing bug was already fixed), or deliberately with conflicting flags — and nothing warns you. Worth considering a duplicate check/warning when adding items that already exist in the current expression.

- **Visual Accessibility** — Many things in the UI are only distinguished by color. This is not sufficient. Especially egregious are the red/green status indicators of icons. Augment with badges?

- **text field placeholders** — Many textfields have default text which must be replaced instead of placeholder attributes (*e.g.* “New Cohort Definition”). Maybe placeholder wasn’t broadly available when originally written? Maybe something to do with data binding?



## Infrastructure

- ~~**SNOMED agreement** — To make testing easier, only trigger the SNOMED agreement modal when NODE_ENV set to 'production'.~~ Done 2026-07-09: `appConfig.enableTermsAndConditions` (`js/config/app.js`) now gates on `process.env.NODE_ENV === 'production'`. Verified the modal is skipped under `npm run dev` and still shows in a real `NODE_ENV=production` build.

- ~~**.mjs -> .js** — now that we have `"type": "module"` in package.json, re-adopt standard file extension~~ Done 2026-07-09: renamed the 6 remaining `.mjs` files (`vite.config.js`, `eslint.config.js`, `tests/register-hooks.js`, `tests/hooks.js`, `build/amd-to-esm.js`, `.claude/skills/run-atlas/scripts/driver.js`) and updated every reference (`package.json` scripts, `tests/register-hooks.js`'s hook registration, `CLAUDE.md`, `MIGRATION_STATUS.md`, the `run-atlas` skill). Verified with lint/test/build plus a live dev-server smoke test.

- **Environment variable support** — webapi's config (`webapi/src/config.js`) is fairly minimal (`EXPRESS_PORT`, `EXPRESS_HOST`, `DB_PATH`, `WEBAPI_AUTH_HEADER`, `WEBAPI_VERSION`, `WEBAPI_SOURCES`). Worth revisiting what else should be externally configurable as the testing/deployment setup matures (e.g. per-source auth, logging level, CORS origins) rather than requiring code or compose file changes.

- **old-style js** — The Javascript/ECMAScript language has progressed considerably since much of this code base was written. Update awkward idioms to use newer, cleaner capabilities.

- **@ohdsi/atlascharts** — ancient tech, incorrect dependencies that affect Atlas. Fork and rewrite. Probably the other @ohdsi/* modules, too.

- **Audit for more production-only bugs** — the Docker image had apparently never actually served the real Vite production bundle until 2026-07-10 (see `CHANGELOG.md`/`MIGRATION_STATUS.md`), and the one production-only bug found once it finally did (`ko.i18n` registration-order, in `js/const.js`) was invisible in dev and in `vite preview` smoke-checks alike — only a real Docker deployment surfaced it. Worth a deliberate pass exercising more of the app against a real production Docker build (not just `npm run dev`/`vite preview`) to catch anything else in this same "works everywhere except the one place it actually ships" category.

- ~~**`esbuild` CSS-minify warnings during `docker build`**~~ Done 2026-07-10: all warnings traced to hand-vendored, git-tracked files in `js/styles/` (not `node_modules`) — obsolete IE6/7 star-hacks (`*cursor: hand`, `*zoom:1`, `*vertical-align`, `*display`, `*margin-top`) in `jquery.datatables.tabletools.css`, `jquery.dataTables.colVis.css`, `jquery.dataTables.min.css`, and `buttons.css`, plus a genuine `calc(100%-1em)` missing-whitespace bug in `atlas.css:32`. Removed the hacks, fixed the calc. Verified with a fresh `docker build` — zero CSS warnings (previously 15+).

- ~~**old filesystem cruft**~~ Done 2026-07-10: `.jshintrc` deleted (zero references anywhere — eslint/neostandard fully replaced it). `.github/workflows/ci.yaml` and `release.yaml` deleted — both were broken for this fork (`npm test -- --runInBand` is a Jest flag but this repo's `test` script uses Node's built-in test runner; both targeted the upstream `ohdsi/atlas` DockerHub image/secrets, not this fork; `release.yaml`'s distribution step predated the Vite migration and didn't match current build output). `.editorconfig` kept — still functional, not cruft. `.gitignore`'s `/web.config` entry (IIS-hosting leftover, this fork deploys via Docker/nginx only) left as low-priority/harmless.

- **filesystem layout** — Everything is under js/, styles, html, fonts, data — it's a mess
