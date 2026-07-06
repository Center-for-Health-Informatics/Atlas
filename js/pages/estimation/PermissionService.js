import AuthAPI from 'services/AuthAPI'

export default class PermissionService {
  static isPermittedCreate () {
    return AuthAPI.isPermitted('estimation:post')
  }

  static isPermittedList () {
    return AuthAPI.isPermitted('estimation:get')
  }

  static isPermittedLoad (id) {
    return AuthAPI.isPermitted(`estimation:${id}:get`)
  }

  static isPermittedUpdate (id) {
    return AuthAPI.isPermitted(`estimation:${id}:put`)
  }

  static isPermittedDelete (id) {
    return AuthAPI.isPermitted(`estimation:${id}:delete`)
  }

  static isPermittedCopy (id) {
    return AuthAPI.isPermitted(`estimation:${id}:copy:get`)
  }

  static isPermittedDownload (id) {
    return AuthAPI.isPermitted(`estimation:${id}:download:get`)
  }

  static isPermittedExport (id) {
    return AuthAPI.isPermitted(`estimation:${id}:export:get`)
  }

  static isPermittedGenerate (id, sourceKey) {
    return AuthAPI.isPermitted(`estimation:${id}:generation:*:post`) && AuthAPI.isPermitted(`source:${sourceKey}:access`)
  }

  static isPermittedListGenerations (id) {
    return AuthAPI.isPermitted(`estimation:${id}:generation:get`)
  }

  static isPermittedResults (id) {
    return AuthAPI.isPermitted(`estimation:generation:${id}:result:get`)
  }

  static isPermittedImport () {
    return AuthAPI.isPermitted('estimation:import:post')
  }
}

export const isPermittedCreate = (...args) => PermissionService.isPermittedCreate(...args)
export const isPermittedList = (...args) => PermissionService.isPermittedList(...args)
export const isPermittedLoad = (...args) => PermissionService.isPermittedLoad(...args)
export const isPermittedUpdate = (...args) => PermissionService.isPermittedUpdate(...args)
export const isPermittedDelete = (...args) => PermissionService.isPermittedDelete(...args)
export const isPermittedCopy = (...args) => PermissionService.isPermittedCopy(...args)
export const isPermittedDownload = (...args) => PermissionService.isPermittedDownload(...args)
export const isPermittedExport = (...args) => PermissionService.isPermittedExport(...args)
export const isPermittedGenerate = (...args) => PermissionService.isPermittedGenerate(...args)
export const isPermittedListGenerations = (...args) => PermissionService.isPermittedListGenerations(...args)
export const isPermittedResults = (...args) => PermissionService.isPermittedResults(...args)
export const isPermittedImport = (...args) => PermissionService.isPermittedImport(...args)
