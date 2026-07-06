import AuthAPI from 'services/AuthAPI'
import sharedState from 'atlas-state'

export default class PermissionService {
  static isPermittedGetInfo (sourceKey, conceptId) {
    return AuthAPI.isPermitted(`vocabulary:${sourceKey}:concept:${conceptId}:get`)
  }

  static isPermittedGetRC (sourceKey) {
    return AuthAPI.isPermitted(`cdmresults:${sourceKey}:conceptRecordCount:post`)
  }

  static isPermittedLookupIds () {
    return this.isVocabularyUrlExists && AuthAPI.isPermitted(`vocabulary:${sharedState.sourceKeyOfVocabUrl()}:lookup:identifiers:post`)
  }

  static get isVocabularyUrlExists () {
    return sharedState.vocabularyUrl() !== undefined
  }

  static isPermittedLookupCodes () {
    return this.isVocabularyUrlExists && AuthAPI.isPermitted(`vocabulary:${sharedState.sourceKeyOfVocabUrl()}:lookup:sourcecodes:post`)
  }
}

export function isPermittedGetInfo (sourceKey, conceptId) {
  return AuthAPI.isPermitted(`vocabulary:${sourceKey}:concept:${conceptId}:get`)
}
export function isPermittedGetRC (sourceKey) {
  return AuthAPI.isPermitted(`cdmresults:${sourceKey}:conceptRecordCount:post`)
}
export function isPermittedLookupIds () {
  return sharedState.vocabularyUrl() !== undefined && AuthAPI.isPermitted(`vocabulary:${sharedState.sourceKeyOfVocabUrl()}:lookup:identifiers:post`)
}
export function isPermittedLookupCodes () {
  return sharedState.vocabularyUrl() !== undefined && AuthAPI.isPermitted(`vocabulary:${sharedState.sourceKeyOfVocabUrl()}:lookup:sourcecodes:post`)
}
