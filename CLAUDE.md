# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Atlas

ATLAS is an open source web application for OHDSI (Observational Health Data Sciences and Informatics) researchers. It provides a UI to define cohorts, run statistical analyses, browse medical concepts, and view patient profiles — all backed by the [WebAPI](https://github.com/OHDSI/WebAPI) REST service and OMOP CDM-formatted observational health data.

## Commands

```bash
# Install dependencies
npm install

# Run the dev server (Vite, proxies /webapi to a WebAPI backend — see vite.config.js)
npm run dev

# Run tests
npm test

# Lint (neostandard-based ESLint config)
npm run lint
npm run lint:fix

# Full build (install + clean + generate version + vite build)
npm run build

# Dev build only (no install/clean/genversion, just `vite build`)
npm run build:dev

# Docker build
npm run build:docker
```

The app is served by Vite in dev (`npm run dev`, default port 5173) and built into `js/assets/bundle/` for production (`npm run build`), with `index.html` as the entry point. A running WebAPI instance is required — configured via `js/config-local.js` (gitignored, created by the user; see "Local configuration" below).

## Architecture

### Module system

The codebase is **ESM** (`import`/`export`), bundled by **Vite**. `package.json` declares `"type": "module"`. A handful of third-party vendor files still use the older UMD/AMD `define(...)` wrapper pattern (e.g. `jquery.ddslick.js`, `jnj.chart.js`, `knockout.selectOnFocus.js`) — these are genuinely still in use and load fine under Vite via bare-specifier aliases in `vite.config.js`, they just haven't been rewritten as ESM since nothing requires it. There is no RequireJS/AMD loader in the app anymore.

`vite.config.js` carries a large `resolve.alias` list that maps the old RequireJS-style bare module names (`'appConfig'`, `'atlas-state'`, `'const'`, `'services/...'`, `'pages/...'`, etc.) to real file paths, plus aliases for npm packages that ship non-standard entry points. When you see an import like `import sharedState from 'atlas-state'`, check `vite.config.js` to find what it actually resolves to.

### Core wiring

- **Entry point**: `index.html` → `<script type="module" src="/js/main.js">` loads core deps/styles, then bootstraps the app. `js/main.js` writes step-by-step load progress to `console.log`/`document.title` when `process.env.NODE_ENV !== 'production'`, to make module-load failures easy to spot during development — silent in production builds.
- **Application**: `js/Application.js` — initializes auth, sources, jobs, locale, and unsaved-change tracking.
- **Router**: `js/pages/Router.js` — uses the `director` library; reads routes from each page module and dispatches to the matching Knockout component.
- **Shared state**: `js/components/atlas-state.js` — a singleton observable state bag (sources, current entities, dirty flags, locale, job listing, etc.). Import as `'atlas-state'`.
- **Constants/enums**: `js/const.js` — application-wide enums (applicationStatuses, generationStatuses, executionStatuses, sqlDialects, etc.). Import as `'const'`.
- **Config**: `js/config/app.js` is the base config, deep-merged with `js/config/terms-and-conditions.js` via lodash `mergeWith` in `js/config.js`. `js/config.js` is also the single place env vars flow in: `VITE_WEBAPI_URL`/`VITE_WEBAPI_NAME` at build time (see "Local configuration" below), and `window.ATLAS_RUNTIME_CONFIG` (populated from `docker/runtime-config.template.js`, `@@VAR@@`-substituted via `sed` at container start — not `envsubst`, whose `${VAR}` syntax collides with real JS template literals) at container runtime, merged in last so it takes precedence. Import the merged config as `'appConfig'`.

### UI framework

**Knockout.js 3.5** with `ko.options.deferUpdates = true`. Components follow the `.js` + `.html` + optional `.less` pattern. The base `Component` class in `js/components/Component.js` provides BEM CSS helpers, subscription cleanup, and `isAuthenticated`.

### Pages

Each subdirectory of `js/pages/` is a feature area (cohort-definitions, concept-sets, estimation, etc.). Every page exports an object with `{ title, buildRoutes, navUrl, icon, statusCss }`. The nav order in the left sidebar is determined by the export order in [js/pages/main.js](js/pages/main.js).

### Services

`js/services/` contains API clients and utility services. `services/http.js` wraps the `ohdsi-api` base class and handles auth headers, 401/404 responses, and i18n headers. All WebAPI calls go through this module.

### Internationalization

Strings use `ko.i18n('key', 'default English text')` throughout the codebase. Locale is loaded at runtime from WebAPI (`/i18n?lang=...`) and stored in `atlas-state.localeSettings`.

### Build

`npm run build` / `build:dev` / `build:docker` all run **`vite build`** (see `vite.config.js`). The old RequireJS-optimizer + Babel + Terser pipeline (`build/optimize.js`, `build/polyfill.js`) is gone — Vite handles bundling, transpilation (via `@vitejs/plugin-legacy` for older-browser fallback bundles), and minification directly. `genversion` (`genversion -e js/version.js`) writes a plain ESM `js/version.js` consumed via the `'version'` alias.

## Testing

Tests live in `tests/` and run on **Node's built-in test runner** (`node --import ./tests/register-hooks.js --test`), not Jest. Since app source is plain ESM, tests import modules directly — no AMD/RequireJS shim needed. The one wrinkle: some subject modules import Vite-only bare aliases (`appConfig`, `atlas-state`, etc.) that plain Node can't resolve; `tests/hooks.js` (registered via `tests/register-hooks.js`) is a custom module-resolution hook that redirects those specifiers to stub files in `tests/stubs/`. See `tests/utils/CommonUtils.test.js` for the canonical pattern of stubbing Atlas dependencies.

## Local configuration

To point `npm run dev`/`npm run build` at a WebAPI instance without modifying tracked files, set `VITE_WEBAPI_URL` (and optionally `VITE_WEBAPI_NAME`) as an environment variable — e.g. in a gitignored `.env.local` file (Vite loads this automatically) or via `direnv`/`.envrc`:

```
VITE_WEBAPI_URL=http://my-webapi-host:8080/WebAPI/
VITE_WEBAPI_NAME=My Instance
```

`js/config.js` reads these directly via `import.meta.env.VITE_*` — there's no separate config file to create. (Container runtime configuration, for a *built* image without a rebuild, is a different mechanism — see `docker/runtime-config.template.js` and the `ATLAS_*`/`WEBAPI_URL` env vars documented in `Dockerfile`.)

## Migration history

This codebase was migrated from AMD/RequireJS to ESM/Vite; see `MIGRATION_STATUS.md` for the full history if you run into something that looks like a leftover from that transition.
