// Node module-resolution hook for tests. App source uses bare specifiers
// (`appConfig`, `atlas-state`, ...) that only resolve via Vite's alias config
// (see ../vite.config.mjs) — this mirrors the handful of those aliases that
// tests actually need, redirecting them to lightweight stubs instead.
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const stubsDir = path.join(__dirname, 'stubs')

const aliasMap = {
  appConfig: 'appConfig.js',
  'atlas-state': 'atlas-state.js',
  'pages/Page': 'pages/Page.js',
  'services/MomentAPI': 'services/MomentAPI.js',
  const: 'const.js',
}

export async function resolve (specifier, context, nextResolve) {
  const stub = aliasMap[specifier]
  if (stub) {
    return nextResolve(pathToFileURL(path.join(stubsDir, stub)).href, context)
  }
  return nextResolve(specifier, context)
}
