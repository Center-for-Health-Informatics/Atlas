import app from './config/app'
import termsAndConditions from './config/terms-and-conditions'
import localConfig from 'config-local' // was optional!
import gisConfig from 'config-gis' // was optional!
import { mergeWith } from 'utils/NativeCompat'

if (JSON.stringify(localConfig) === JSON.stringify({})) {
  console.warn('Local configuration not found.  Using default values. To use a local configuration and suppress 404 errors, create a file called config-local.js under the /js directory')
}

const configs = [app,
  termsAndConditions,
  localConfig,
  gisConfig,
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

config.webAPIRoot = config.api.url

export default config
