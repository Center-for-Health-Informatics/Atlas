import AuthAPI from 'services/AuthAPI'
import sharedState from 'atlas-state'

const isPermittedSearch = () => {
  return sharedState.vocabularyUrl() !== undefined && AuthAPI.isPermitted(`vocabulary:${sharedState.sourceKeyOfVocabUrl()}:search:*:get`)
}

export default {
  isPermittedSearch,
}

