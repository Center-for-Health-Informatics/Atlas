# Future Considerations

Running list of things worth revisiting. Not bugs blocking current work — just noted for later.

## UI/UX

- **Checkbox contrast** — the `.fa-check` checkbox glyph (used throughout search results, concept set editors, etc.) renders an unchecked state as `color: #eee` on white, which is easy to mistake for a checked/greyed-out box at a glance. Working as designed (upstream Atlas CSS in `js/styles/atlas.css`), but worth reconsidering — e.g. an actual empty box when unchecked, filled only when checked, would be less ambiguous.

- **No duplicate-concept guard in concept sets** — Atlas has never validated or deduped concept IDs within a concept set's item list (`components/conceptset/utils.js` `addItemsToConceptSet` just pushes). You can add the same concept twice — once by mistake (a related checkbox-clearing bug was already fixed), or deliberately with conflicting flags — and nothing warns you. Worth considering a duplicate check/warning when adding items that already exist in the current expression.

- **Visual Accessibility** — Many things in the UI are only distinguished by color. This is not sufficient. Especially egregious are the red/green status indicators of icons. Augment with badges?

- **text field placeholders** — Many textfields have default text which must be replaced instead of placeholder attributes (*e.g.* “New Cohort Definition”). Maybe placeholder wasn’t broadly available when originally written? Maybe something to do with data binding?



## Infrastructure

- **.mjs -> .js** - now that we have `"type": "module"` in package.json, re-adopt standard file extension

- **Environment variable support** — webapi's config (`webapi/src/config.js`) is fairly minimal (`EXPRESS_PORT`, `EXPRESS_HOST`, `DB_PATH`, `WEBAPI_AUTH_HEADER`, `WEBAPI_VERSION`, `WEBAPI_SOURCES`). Worth revisiting what else should be externally configurable as the testing/deployment setup matures (e.g. per-source auth, logging level, CORS origins) rather than requiring code or compose file changes.

- **old-style js** — The Javascript/ECMAScript language has progressed considerably since much of this code base was written. Update awkward idioms to use newer, cleaner capabilities.
