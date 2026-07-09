import ko from 'knockout'
import config from 'appConfig'
import httpService from 'services/http'
import authApi from 'services/AuthAPI'

async function loadRoleSuggestions (roleSearch) {
  const res = await httpService.doGet(config.webAPIRoot + 'permission/access/suggest', { roleSearch })
  return res.data
}

async function loadEntityAccessList (entityType, entityId, permType = 'WRITE') {
  const res = await httpService.doGet(config.webAPIRoot + `permission/access/${entityType}/${entityId}/${permType}`)
  return res.data
}

function grantEntityAccess (entityType, entityId, roleId, permType = 'WRITE') {
  return httpService.doPost(
    config.webAPIRoot + `permission/access/${entityType}/${entityId}/role/${roleId}`,
    {
      accessType: permType
    }
  )
}

function revokeEntityAccess (entityType, entityId, roleId, permType = 'WRITE') {
  return httpService.doDelete(
    config.webAPIRoot + `permission/access/${entityType}/${entityId}/role/${roleId}`,
    {
      accessType: permType
    }
  )
}

function decorateComponent (component, { entityTypeGetter, entityIdGetter, createdByUsernameGetter }) {
  component.isAccessModalShown = ko.observable(false)

  component.isOwnerFn = (username) => {
    return createdByUsernameGetter() === username
  }

  component.isOwner = ko.computed(() => config.userAuthenticationEnabled && component.isOwnerFn(authApi.subject()))

  component.loadAccessList = (permType = 'WRITE') => {
    return loadEntityAccessList(entityTypeGetter(), entityIdGetter(), permType)
  }

  component.grantAccess = (roleId, permType = 'WRITE') => {
    return grantEntityAccess(entityTypeGetter(), entityIdGetter(), roleId, permType)
  }

  component.revokeAccess = (roleId, permType = 'WRITE') => {
    return revokeEntityAccess(entityTypeGetter(), entityIdGetter(), roleId, permType)
  }

  component.loadAccessRoleSuggestions = (searchStr) => {
    return loadRoleSuggestions(searchStr)
  }
}

export { loadEntityAccessList, grantEntityAccess, revokeEntityAccess, loadRoleSuggestions, decorateComponent }
export default { loadEntityAccessList, grantEntityAccess, revokeEntityAccess, loadRoleSuggestions, decorateComponent }
