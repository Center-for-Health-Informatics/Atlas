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

- **@ohdsi/atlascharts** — ancient tech, incorrect dependencies that affect Atlas. Fork and rewrite.
