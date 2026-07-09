---
name: run-atlas
description: Use when asked to run, launch, start, or drive the Atlas frontend (this repo's Vite/Knockout.js app) in a browser — e.g. to verify a UI change, click through a workflow, or take a screenshot for documentation. Triggers on "run the app", "start the dev server", "click through", "screenshot", "smoke-test", "does this render", or any request to see a change working in the real Atlas UI rather than just via tests or type-checking.
version: 1.0.0
---

# Running and driving Atlas

Atlas is a browser-driven Knockout.js app served by Vite — there is no
meaningful way to "run" it without a browser rendering pages against a
live WebAPI backend. This skill covers both: starting the dev server,
and driving a headless Chromium against it via a small Playwright REPL
(`scripts/driver.mjs`), since `chromium-cli` is not available in this
environment.

## 1. Point the app at a WebAPI backend

The app needs `js/config-local.js` (gitignored, not tracked) to know
which WebAPI instance to hit. If it doesn't exist yet, create it:

```js
export default {
  api: {
    name: 'Local Synthea',
    url: import.meta.env.VITE_WEBAPI_URL || 'https://dev.lastchance.pub/webapi/'
  },
}
```

`https://dev.lastchance.pub/webapi/` is a shared test instance backed
by a Synthea CDM — fine for smoke-testing UI flows. Don't assume any
particular data exists there beyond whatever the current session has
created (it's shared and not reset between sessions).

## 2. Start the dev server

```bash
npm run dev > /tmp/atlas-vite.log 2>&1 &
echo $! > /tmp/atlas-vite.pid
until curl -sf http://localhost:5173/atlas/ >/dev/null; do sleep 1; done
```

Stop it with `kill $(cat /tmp/atlas-vite.pid)` (or `lsof -ti:5173 | xargs kill`)
before relaunching, or the next run hits `EADDRINUSE`. If 5173 is
already taken (e.g. the user has their own `npm run dev` running),
Vite auto-picks the next free port and prints it — read the actual
port from its stdout rather than assuming 5173.

## 3. Drive it with the bundled Playwright REPL

Chromium needs to be installed once per machine:

```bash
npx playwright install chromium
```

Then pipe a script of commands into the driver (one command per line):

```bash
node .claude/skills/run-atlas/scripts/driver.mjs <<'EOF'
nav http://localhost:5173/atlas/
sleep 3000
eval (function(){const b=Array.from(document.querySelectorAll('button')).find(x=>x.textContent.trim()==='Accept'); if(b) b.click();}())
sleep 1500
click-text Cohort Definitions
sleep 2000
screenshot cohort-definitions-list.png
EOF
```

Screenshots land in `.claude/skills/run-atlas/scripts/screenshots/`
(gitignored — treat as scratch output, not something to commit).
**Always read the screenshot file after capturing it** — a blank or
unexpected frame means something didn't render, and console/page
errors printed to stdout won't always tell the whole story.

### Command reference

| Command | Effect |
|---|---|
| `nav <url>` | Navigate |
| `wait-for <selector>` | Wait for a CSS selector to appear |
| `wait-text <text>` | Wait for visible text to appear |
| `click <selector>` | Click by CSS selector |
| `click-text <text>` | Click the first element containing this text (most Atlas UI has no stable selectors — this is usually easier than `click`) |
| `fill <selector> <value>` | Fill an input (goes through Playwright's input pipeline, so Knockout's `textInput`/`value` bindings pick it up) |
| `sleep <ms>` | Wait a fixed time (use for KO re-render settling; `wait-for`/`wait-text` are preferred when there's a concrete element to wait on) |
| `screenshot [name.png]` | Full-page screenshot |
| `screenshot-element <selector> <name.png>` | Crop to one element — use to avoid the left sidebar nav in every shot |
| `screenshot-clip <selector> <padding-px> <name.png>` | Screenshot just an element's bounding box + padding — best for cleanly cropping modals (e.g. `.modal.fade.in .modal-content`) |
| `text <selector>` | Print an element's textContent |
| `url` | Print the current page URL |
| `eval <js>` | Run `page.evaluate(js)` and print the result — useful for inspecting DOM structure to find a good selector, or firing native input events for KO-controlled inputs (see gotcha below) |
| `quit` | Close the browser and exit |

Console errors and uncaught page errors (with stack traces) are
printed automatically as they happen — check for these even when a
screenshot looks fine, since a page can render its shell while a
binding throws underneath it.

## Gotchas specific to this app

- **The SNOMED CT license modal blocks every fresh page load** — not
  once per session, every `nav`. Dismiss it before interacting with
  anything else:
  ```
  eval (function(){const b=Array.from(document.querySelectorAll('button')).find(x=>x.textContent.trim()==='Accept'); if(b) b.click();}())
  ```
- **Knockout's `textInput`/`value` bindings need a real `input` event**,
  not just a DOM property set — `fill` already handles this correctly,
  but if you're setting a value via `eval`, dispatch the event yourself:
  ```
  eval (function(){const i=document.querySelector('input.form-control[placeholder]'); const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; setter.call(i,'some value'); i.dispatchEvent(new Event('input',{bubbles:true}))}())
  ```
- **Bootstrap 3 modals**: the currently-open one is the element matching
  `.modal.fade.in` (note: `.in`, not `.show` — this app uses Bootstrap 3,
  not 4/5). Use `.modal.fade.in .modal-content` as the target for
  `screenshot-clip` when cropping a modal.
- **First navigation after a fresh dev-server start can take 10s+**
  (Vite compiles routes on demand). `sleep 3000`+ after the first `nav`
  in a session; subsequent navigations are fast.
- **CSS selectors with commas or spaces inside attribute values will
  break the driver's naive `arg.split(' ')` parsing** for `fill`,
  `screenshot-element`, and `screenshot-clip` (it splits the first
  space to separate selector from value/filename). Prefer a plain
  class/tag selector, or fall back to `eval` with a hand-written
  `querySelector`.
