import app from './config/app'
import termsAndConditions from './config/terms-and-conditions'
import { mergeWith } from 'utils/NativeCompat'

const configs = [app,
  termsAndConditions,
]
const config = configs.reduce((accumulator, currentValue) => mergeWith(accumulator, currentValue, customizer))

function customizer (objValue, srcValue, key) {
  if (key === 'externalLibraries' && Array.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
  if (key === 'authProviders' && Array.isArray(srcValue)) {
    return srcValue
  }
};

// Build-time overrides via Vite env vars (shell env, .envrc, or a gitignored
// .env.local — see https://vitejs.dev/guide/env-and-mode.html). This is the one
// and only way to configure a local dev/build WebAPI target; there is no
// separate config-local.js file to create anymore.
if (import.meta.env.VITE_WEBAPI_URL) config.api.url = import.meta.env.VITE_WEBAPI_URL
if (import.meta.env.VITE_WEBAPI_NAME) config.api.name = import.meta.env.VITE_WEBAPI_NAME

// Runtime container configuration (docker/runtime-config.template.js, substituted
// from ATLAS_*/WEBAPI_URL env vars at container start) takes precedence over the
// build-time config above, so images can be reconfigured via `docker run -e` /
// compose `environment:` without a rebuild. This is the one necessary exception
// to "env vars flow straight into config" above: a browser can't read the
// container's process env directly once the app has already been built and
// shipped, so this merges in a small file rewritten via sed (see
// docker/30-atlas-env-subst.sh) at container start instead.
if (typeof window !== 'undefined' && window.ATLAS_RUNTIME_CONFIG) {
  mergeWith(config, window.ATLAS_RUNTIME_CONFIG, customizer)
}

config.webAPIRoot = config.api.url

export default config
