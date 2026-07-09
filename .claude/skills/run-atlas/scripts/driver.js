// Minimal Playwright REPL for driving the Atlas frontend from an agent shell.
// Reads line-delimited commands from stdin; each line is one command.
// See ../SKILL.md for the full command reference and usage patterns.
//
// Usage:
//   node driver.js <<'EOF'
//   nav http://localhost:5173/atlas/
//   sleep 2000
//   screenshot home.png
//   EOF

import { chromium } from 'playwright'
import { createInterface } from 'readline'
import { mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const shotDir = join(__dirname, 'screenshots')
mkdirSync(shotDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ ignoreHTTPSErrors: true })
page.on('console', msg => {
  if (msg.type() === 'error') console.log('[console error]', msg.text())
})
page.on('pageerror', err => console.log('[page error]', err.stack || err.message))
page.on('response', res => {
  if (res.status() >= 400) console.log('[http error]', res.status(), res.request().method(), res.url())
})

let shotCount = 0

const rl = createInterface({ input: process.stdin })
for await (const line of rl) {
  const [cmd, ...rest] = line.trim().split(' ')
  const arg = rest.join(' ')
  if (!cmd) continue
  try {
    if (cmd === 'nav') {
      await page.goto(arg, { waitUntil: 'domcontentloaded', timeout: 30000 })
      console.log('OK nav', arg)
    } else if (cmd === 'wait-for') {
      await page.waitForSelector(arg, { timeout: 15000 })
      console.log('OK wait-for', arg)
    } else if (cmd === 'wait-text') {
      await page.getByText(arg).first().waitFor({ timeout: 15000 })
      console.log('OK wait-text', arg)
    } else if (cmd === 'click') {
      await page.click(arg, { timeout: 10000 })
      console.log('OK click', arg)
    } else if (cmd === 'click-text') {
      // Matches Atlas's many un-selectorable Knockout-bound buttons/links by visible text.
      await page.getByText(arg, { exact: false }).first().click({ timeout: 10000 })
      console.log('OK click-text', arg)
    } else if (cmd === 'fill') {
      const idx = arg.indexOf(' ')
      const sel = arg.slice(0, idx)
      const val = arg.slice(idx + 1)
      await page.fill(sel, val, { timeout: 10000 })
      console.log('OK fill', sel)
    } else if (cmd === 'sleep') {
      await page.waitForTimeout(Number(arg))
      console.log('OK sleep', arg)
    } else if (cmd === 'screenshot') {
      shotCount++
      const name = arg || `shot-${shotCount}.png`
      await page.screenshot({ path: `${shotDir}/${name}`, fullPage: true })
      console.log('OK screenshot', `${shotDir}/${name}`)
    } else if (cmd === 'screenshot-element') {
      // usage: screenshot-element <selector> <name.png> — crops to one element,
      // e.g. to avoid the left sidebar nav.
      const idx = arg.indexOf(' ')
      const sel = arg.slice(0, idx)
      const name = arg.slice(idx + 1)
      await page.locator(sel).first().screenshot({ path: `${shotDir}/${name}` })
      console.log('OK screenshot-element', `${shotDir}/${name}`)
    } else if (cmd === 'screenshot-clip') {
      // usage: screenshot-clip <selector> <padding-px> <name.png> — computes the
      // element's bounding box + padding and screenshots just that region.
      // Best for cropping modals/panels cleanly (e.g. a Bootstrap modal-content).
      const parts = arg.split(' ')
      const name = parts.pop()
      const padding = Number(parts.pop())
      const sel = parts.join(' ')
      const box = await page.locator(sel).first().boundingBox()
      if (!box) throw new Error('element not found or not visible: ' + sel)
      const clip = {
        x: Math.max(0, box.x - padding),
        y: Math.max(0, box.y - padding),
        width: box.width + padding * 2,
        height: box.height + padding * 2,
      }
      await page.screenshot({ path: `${shotDir}/${name}`, clip })
      console.log('OK screenshot-clip', `${shotDir}/${name}`, JSON.stringify(clip))
    } else if (cmd === 'text') {
      const t = await page.textContent(arg)
      console.log('TEXT', t)
    } else if (cmd === 'url') {
      console.log('URL', page.url())
    } else if (cmd === 'eval') {
      const r = await page.evaluate(arg)
      console.log('EVAL', r)
    } else if (cmd === 'quit') {
      break
    } else {
      console.log('unknown command', cmd)
    }
  } catch (e) {
    console.log('ERR', e.message)
  }
}

await browser.close()
process.exit(0)
