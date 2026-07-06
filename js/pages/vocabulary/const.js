import sharedState from 'atlas-state'

const pageTitle = 'Search'
const apiPaths = {
  domains: () => sharedState.vocabularyUrl() + 'domains',
  vocabularies: () => sharedState.vocabularyUrl() + 'vocabularies',
}

export { pageTitle, apiPaths }
export default { pageTitle, apiPaths }

