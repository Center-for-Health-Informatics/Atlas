# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Atlas

ATLAS is an open source web application for OHDSI (Observational Health Data Sciences and Informatics) researchers. It provides a UI to define cohorts, run statistical analyses, browse medical concepts, and view patient profiles — all backed by the [WebAPI](https://github.com/OHDSI/WebAPI) REST service and OMOP CDM-formatted observational health data.

## Commands

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run a single test file
npx jest tests/utils/CommonUtils.test.js --runInBand

# Full build (install + clean + generate version + bundle + minify)
npm run build

# Dev build only (no install/clean/genversion)
npm run build:dev

# Docker build
npm run build:docker
```

There is no dev server — Atlas is served as static files. Point a web server at the project root; the entry point is `index.html`. A running WebAPI instance is required at the URL configured in `js/config/app.js` (default: `http://localhost:8080/WebAPI/`).

## Architecture

### Module system

The entire codebase uses **AMD (RequireJS)** modules — every file uses `define([...deps], factory)` or `define(factory)`. There is no ES module `import`/`export` syntax in application code. The module IDs map to paths configured in [js/settings.js](js/settings.js).

### Core wiring

- **Entry point**: `index.html` → `js/main.js` loads RequireJS, applies settings, then bootstraps the app.
- **Application**: `js/Application.js` — initializes auth, sources, jobs, locale, and unsaved-change tracking.
- **Router**: `js/pages/Router.js` — uses the `director` library; reads routes from each page module and dispatches to the matching Knockout component.
- **Shared state**: `js/components/atlas-state.js` — a singleton observable state bag (sources, current entities, dirty flags, locale, job listing, etc.). Import as `'atlas-state'`.
- **Constants/enums**: `js/const.js` — application-wide enums (applicationStatuses, generationStatuses, executionStatuses, sqlDialects, etc.). Import as `'const'`.
- **Config**: `js/config/app.js` is the base config; `js/config/local.js` (gitignored, created by the user) and `docker/config-local.js` (template) override it. Import the merged config as `'appConfig'`.

### UI framework

**Knockout.js 3.5** with `ko.options.deferUpdates = true`. Components follow the `.js` + `.html` + optional `.less` pattern. The base `Component` class in `js/components/Component.js` provides BEM CSS helpers, subscription cleanup, and `isAuthenticated`.

### Pages

Each subdirectory of `js/pages/` is a feature area (cohort-definitions, concept-sets, estimation, etc.). Every page exports an object with `{ title, buildRoutes, navUrl, icon, statusCss }`. The nav order in the left sidebar is determined by the export order in [js/pages/main.js](js/pages/main.js).

### Services

`js/services/` contains API clients and utility services. `services/http.js` wraps the `ohdsi-api` base class and handles auth headers, 401/404 responses, and i18n headers. All WebAPI calls go through this module.

### Internationalization

Strings use `ko.i18n('key', 'default English text')` throughout the codebase. Locale is loaded at runtime from WebAPI (`/i18n?lang=...`) and stored in `atlas-state.localeSettings`.

### Build

The build uses **RequireJS optimizer** (`r.js`) via `build/optimize.js` to bundle everything into `js/assets/bundle/bundle.js`, then **Terser** to minify. Babel transforms (preset-env + object-rest-spread) are applied during the r.js build step.

## Testing

Tests live in `tests/` and use **Jest 29** with the `requirejsInstance` global (configured in `jest.config.js`). Because AMD modules can't be directly imported by Jest, tests load them via `requireAmd([...])` (also a global). Stub out Atlas dependencies (`atlas-state`, `appConfig`, etc.) with `requirejsInstance.define(...)` in `beforeAll`. See `tests/utils/CommonUtils.test.js` for the canonical pattern.

## Local configuration

To override the WebAPI URL without modifying tracked files, create `js/config-local.js`:

```js
define([], function () {
  return {
    api: {
      name: 'My Instance',
      url: 'http://my-webapi-host:8080/WebAPI/'
    }
  };
});
```

This file is loaded via `optional!config-local` in `js/config.js` and deep-merged with the base config using lodash `mergeWith`.
