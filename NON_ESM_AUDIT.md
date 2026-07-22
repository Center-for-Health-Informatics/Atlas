# Non-ESM Module Audit (AMD / UMD / CJS)

Audit date: 2026-07-22. Scope: `atlas/` source (`js/**`, excluding build output) and its declared `package.json` dependencies. See [MIGRATION_STATUS.md](MIGRATION_STATUS.md) for the history of how the app source got here.

## Summary

- **App source (`js/**`, excluding `js/assets/bundle`): clean.** No `require()`, no `module.exports`/`exports.*`, and no application code left in AMD form. `package.json` declares `"type": "module"`.
- **3 vendored UMD files remain in `js/`, all confirmed genuinely in use** (per `MIGRATION_STATUS.md`'s 2026-07-09 cruft removal, re-verified here). These are third-party scripts pasted into the tree, not app code — the AMD branch in each is dead weight since `define` is never a global in this app, but the browser-global fallback is what actually executes.
- **`node_modules` dependencies: mixed.** Of 33 runtime `dependencies`, 20 ship CJS as their primary/only format. Vite's dev server and Rollup-based build both handle CJS transparently, so this isn't a functional problem — it's the audit trail for "what looks unmaintained."

## 1. Vendored UMD files in `js/`

| File | Pattern | Status |
|---|---|---|
| [js/assets/jnj.chart.js](js/assets/jnj.chart.js) | Classic UMD: `typeof define === 'function' && define.amd` → AMD branch, else attaches to `root.jnj_chart` | In active use. No upstream npm package — hand-maintained fork. |
| [js/assets/jqueryui/jquery.ddslick.js](js/assets/jqueryui/jquery.ddslick.js) | Same UMD pattern, jQuery-dependent | In active use. Third-party plugin (designwithpc.com), unlikely to see upstream updates — treat as effectively vendored/frozen. |
| [js/extensions/bindings/knockout.selectOnFocus.js](js/extensions/bindings/knockout.selectOnFocus.js) | Half-converted: has a real ESM `import ko from 'knockout'` at the top, but the body is still wrapped in the original UMD factory pattern (`typeof define === 'function' && define.amd` → else `factory(ko)`) | In active use. The AMD branch is unreachable dead code in this app (nothing defines a global `define`); only the `else factory(ko)` branch ever runs. Safe, low-effort cleanup: strip the UMD wrapper down to a plain function body since the ESM import already provides `ko`. |

No other files in `js/` (outside `js/assets/bundle`, which is generated build output and expected to contain bundler-emitted CJS/AMD-shaped code) matched `define(`, `require(`, `module.exports`, or `typeof define/module/exports` checks.

## 2. Dependency module formats (`package.json` dependencies)

"Type" reflects each package's own `package.json` (`"type"` field, or CJS if unset/absent `exports` map pointing elsewhere). Vite/Rollup consume all of these fine regardless of format — this table is about maintenance signal, not breakage risk.

| Package | Installed | Latest on npm | Format | Last published |
|---|---|---|---|---|
| @ohdsi/ui-toolbox | 1.1.0 | 1.1.0 | CJS | 2022-04-06 |
| @ohdsi/visibilityjs | 2.0.2 | 2.0.2 | CJS | 2022-04-06 |
| @popperjs/core | 2.11.8 | 2.11.8 | CJS (has `module` field for bundlers) | 2023-05-26 |
| @upsetjs/venn.js | 2.0.0 | 2.0.0 | ESM | 2025-12-28 |
| ajv | 8.20.0 | 8.20.0 | CJS | 2026-04-24 |
| bootstrap | 5.3.8 | 5.3.8 | CJS (+ `.esm.js` build available) | 2026-06-05 |
| clipboard | 2.0.11 | 2.0.11 | CJS | 2023-08-20 |
| colorbrewer | 1.7.0 | 1.7.0 | ESM (+ CJS `main`) | 2026-03-26 |
| crossfilter2 | 1.5.4 | 1.5.4 | CJS (+ `module` field) | 2022-08-21 |
| d3 | 7.9.0 | 7.9.0 | ESM | 2025-05-17 |
| d3-scale-chromatic | 3.1.0 | 3.1.0 | ESM | 2024-03-12 |
| d3-tip | 0.9.1 | 0.9.1 | CJS (+ `module` field) | 2024-05-06 |
| datatables.net | 2.3.8 | 2.3.8 | CJS (+ `.mjs` build available) | 2026-04-27 |
| datatables.net-buttons | 3.2.6 | 3.2.6 | CJS (+ `.mjs` build available) | 2026-04-07 |
| datatables.net-select | 3.1.3 | 3.1.3 | CJS (+ `.mjs` build available) | 2026-04-07 |
| director | 1.2.8 | 1.2.8 | CJS | 2022-06-15 |
| facets | 0.1.1 | 0.1.1 | CJS | 2022-06-17 |
| html2canvas | 1.4.1 | 1.4.1 | CJS (+ `.esm.js` build available) | 2025-11-13 |
| jquery | 4.0.0 | 4.0.0 | ESM | 2026-01-18 |
| jquery-ui | 1.14.2 | 1.14.2 | CJS | 2026-01-28 |
| jszip | 3.10.1 | 3.10.1 | CJS | 2025-03-14 |
| knockout | 3.5.3 | 3.5.3 | CJS | 2026-03-25 |
| knockout-sortable | 1.3.0 | 1.3.0 | CJS | 2026-02-06 |
| lodash | 4.18.1 | 4.18.1 | CJS | 2026-07-22 |
| lscache | 1.3.2 | 1.3.2 | CJS | 2022-06-19 |
| lz-string | 1.5.0 | 1.5.0 | CJS | 2023-03-07 |
| moment | 2.30.1 | 2.30.1 | CJS | 2026-06-04 |
| numeral | 2.0.6 | 2.0.6 | CJS | 2022-06-22 |
| papaparse | 5.5.4 | 5.5.4 | CJS | 2026-06-19 |
| pdfmake | 0.2.23 | **0.3.11** | CJS | 2026-06-12 |
| prismjs | 1.30.0 | 1.30.0 | CJS | 2025-03-10 |
| svgsaver | 0.9.0 | 0.9.0 | CJS | 2022-06-27 |
| xss | 1.0.15 | 1.0.15 | CJS | 2026-02-11 |

(`less`, `@vitejs/plugin-legacy`, `eslint`, `neostandard`, `playwright`, `rimraf`, `vite` are devDependencies / tooling, not shipped app code — omitted as out of scope for "what ships to the browser.")

### Packages worth a second look

- **`pdfmake` is 5 semver-minor versions behind** (`0.2.23` installed vs `0.3.11` latest, last published 2026-06-12 — actively maintained upstream, we're just stale). Only dependency here with a real version gap; everything else installed matches latest.
- **Five-package cluster with no publish since 2022**: `@ohdsi/ui-toolbox`, `@ohdsi/visibilityjs`, `director`, `facets`, `lscache`, plus `numeral`, `svgsaver`, `crossfilter2` (2022) and `d3-tip`/`clipboard`/`lz-string` (2023–2024). These aren't necessarily broken — some (director, numeral, svgsaver) are small, feature-complete utilities unlikely to need churn — but they're candidates to watch for unpatched CVEs since nobody's actively publishing fixes.
- **`facets` (0.1.1, last published 2022) and `@ohdsi/*` packages are OHDSI-ecosystem-specific** — low bus factor, worth knowing there's no broader npm community fallback if they need a patch.

## Net assessment

There is no meaningful AMD/CJS problem left in Atlas's own source — the 2026-07-09 migration cleanup (see MIGRATION_STATUS.md) got it to a clean ESM tree except for 3 deliberately-kept vendor files, all still in active use. The remaining non-ESM surface area is entirely in `node_modules`, where format doesn't block anything technically — Vite/Rollup handle CJS fine — but the publish-date table above is a reasonable proxy for "which third-party pieces are effectively frozen and would need manual forking if a bug or CVE ever surfaced in them."
