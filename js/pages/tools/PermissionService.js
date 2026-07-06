import AuthAPI from 'services/AuthAPI'

export default class PermissionService {
  static isPermittedReadTools () {
    return AuthAPI.isPermitted('tool:get')
  }

  static isPermittedCreateTool () {
    return AuthAPI.isPermitted('tool:post')
  }

  static isPermittedUpdateTool () {
    return AuthAPI.isPermitted('tool:put')
  }

  static isPermittedDeleteTool () {
    return AuthAPI.isPermitted('tool:*:delete')
  }
}

export const isPermittedReadTools = (...args) => PermissionService.isPermittedReadTools(...args)
export const isPermittedCreateTool = (...args) => PermissionService.isPermittedCreateTool(...args)
export const isPermittedUpdateTool = (...args) => PermissionService.isPermittedUpdateTool(...args)
export const isPermittedDeleteTool = (...args) => PermissionService.isPermittedDeleteTool(...args)
