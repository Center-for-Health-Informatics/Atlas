import $ from 'jquery'
import config from 'appConfig'
import ko from 'knockout'
import cookie from 'services/CookieAPI'
import httpService from 'services/http'

const TOKEN_HEADER = 'Bearer'
const LOCAL_STORAGE_PERMISSIONS_KEY = 'permissions'
const AUTH_PROVIDERS = {
  IAP: 'AtlasGoogleSecurity',
}

const AUTH_CLIENTS = {
  SAML: 'AUTH_CLIENT_SAML',
}

const signInOpened = ko.observable(false)

function getBearerToken () {
  return localStorage.bearerToken && localStorage.bearerToken !== 'null' && localStorage.bearerToken !== 'undefined' ? localStorage.bearerToken : null
}

const authProviders = config.authProviders.reduce(function (result, current) {
  result[config.api.url + current.url] = current
  return result
}, {})

const getServiceUrl = function () {
  return config.webAPIRoot
}

const token = ko.observable(getBearerToken())
const authClient = ko.computed({
  owner: ko.observable(localStorage.getItem('auth-client')),
  read: function () {
    return this()
  },
  write: function (newValue) {
    localStorage.setItem('auth-client', newValue)
    this(newValue)
  }
})

const getAuthorizationHeader = function () {
  if (!token()) {
    return null
  }
  return TOKEN_HEADER + ' ' + token()
}
$.ajaxSetup({
  beforeSend: function (xhr, settings) {
    if (!authProviders[settings.url] && settings.url.startsWith(config.api.url)) {
      xhr.setRequestHeader('Authorization', getAuthorizationHeader())
      xhr.setRequestHeader('Action-Location', location)
    }
  }
})

const reloginRequired = ko.observable(false)
const subject = ko.observable()
const permissions = ko.observable()
const fullName = ko.observable()
const authProvider = ko.observable()

authProvider.subscribe(provider => {
  if (provider === AUTH_PROVIDERS.IAP) {
    const id = 'google-iap-refresher'
    const iframe = `<iframe id="${id}" src="/_gcp_iap/session_refresher" style="position: absolute; width:0;height:0;border:0; border:none;"></iframe>`
    $('#' + id).remove()
    $('body').append(iframe)
  }
})

const loadUserInfo = function () {
  return new Promise((resolve, reject) => $.ajax({
    url: config.api.url + 'user/me',
    method: 'GET',
    success: function (info, textStatus, jqXHR) {
      permissions(info.permissionIdx)  // read from permission index of User info
      subject(info.login)
      authProvider(jqXHR.getResponseHeader('x-auth-provider'))
      fullName(info.name ? info.name : info.login)
      resolve()
    },
    error: function (err) {
      if (err.status === 401) {
        console.log('User is not authed')
        subject(null)
        if (config.enableSkipLogin) {
          signInOpened(true)
        }
        resolve()
      } else {
        reject('Cannot retrieve user info')
      }
    }
  }))
}

const tokenExpirationDate = ko.pureComputed(function () {
  if (!token()) {
    return null
  }

  try {
    const expirationInSeconds = parseJwtPayload(token()).exp
    return new Date(expirationInSeconds * 1000)
  } catch (e) {
    return new Date()
  }
})

const tokenExpired = ko.observable(false)
const askLoginOnTokenExpire = (function () {
  let expirationTimeout
  return () => {
    if (expirationTimeout) {
      clearTimeout(expirationTimeout)
    }
    if (!token()) {
      tokenExpired(false)
      return
    }
    if (tokenExpirationDate() > new Date()) {
      tokenExpired(false)
      expirationTimeout = setTimeout(
        () => {
          tokenExpired(true)
          signInOpened(true)
          expirationTimeout = null
        },
        tokenExpirationDate() - new Date()
      )
    } else {
      tokenExpired(true)
    }
  }
})()

askLoginOnTokenExpire()
tokenExpirationDate.subscribe(askLoginOnTokenExpire)

window.addEventListener('storage', function (event) {
  if (event.storageArea === localStorage) {
    const bearerToken = getBearerToken()
    if (bearerToken !== token()) {
      token(bearerToken)
    }
  }
}, false)

token.subscribe(function (newValue) {
  localStorage.bearerToken = newValue
  cookie.setField('bearerToken', newValue)
})

const isAuthenticated = ko.computed(() => {
  if (!config.userAuthenticationEnabled) {
    return true
  }

  return !!subject()
})

const handleAccessDenied = function (xhr) {
  switch (xhr.status) {
    case 401:
      resetAuthParams()
      break
    case 403:
      refreshToken()
      break
  }
}

// adapted from https://github.com/apache/shiro/blob/fa518ec985fd192497cd04e2569041b2f469aead/core/src/main/java/org/apache/shiro/authz/permission/WildcardPermission.java#L201

const checkPermission = function (permission, etalon) {
  // etalon may be like '*:read,write:etc', and is a permission assigned to the user.
  // permission is the permission to check
  if (!etalon || !permission) { // both must be non-null to perform a check
    return false
  }

  if (permission == etalon) { // quick check: if equal on both sides, then permission is granted.
    return true
  }

  const etalonLevels = etalon.split(':')
  const permissionLevels = permission.split(':')

  let i = 0
  for (const permissionLevel of permissionLevels) {
    // If this etalon has less parts than the permission, everything after the number of parts contained
    // in this etalon is automatically implied, so return true
    if (etalonLevels.length - 1 < i) {
      return true
    } else {
      var etalonPart = etalonLevels[i].split(',')
      const permissionPart = permissionLevel.split(',')
      if (!etalonPart.includes('*') && !permissionPart.every(pp => etalonPart.includes(pp))) {
        return false
      }
    }
    i++
  }
  // If etalon has more parts than the permission, return true if rest of eLevels contains wildcard
  for (; i < etalonLevels.length; i++) { // loop through remaining etalonLevels
    etalonPart = etalonLevels[i].split(',')
    if (!etalonPart.includes('*')) {
      return false
    }
  }
  return true
}

const isPermitted = function (permission) {
  if (!config.userAuthenticationEnabled) {
    return true
  }

  if (!permissions()) return false

  const firstPerm = permission.split(':')[0]

  const etalons = [...(permissions()['*'] || []), ...(permissions()[firstPerm] || [])]
  if (!etalons) {
    return false
  }

  for (let i = 0; i < etalons.length; i++) {
    if (checkPermission(permission, etalons[i])) {
      return true
    }
  }

  return false
}

function base64urldecode (arg) {
  let s = arg
  s = s.replace(/-/g, '+') // 62nd char of encoding
  s = s.replace(/_/g, '/') // 63rd char of encoding
  switch (s.length % 4) // Pad with trailing '='s
  {
    case 0: break // No pad chars in this case
    case 2: s += '=='; break // Two pad chars
    case 3: s += '='; break // One pad char
    default: throw new Error('Illegal base64url string!')
  }
  return window.atob(s) // Standard base64 decoder
};

function parseJwtPayload (jwt) {
  const parts = jwt.split('.')
  if (parts.length != 3) {
    throw new Error('JSON Web Token must have three parts')
  }

  const payload = base64urldecode(parts[1])
  return $.parseJSON(payload)
};

let refreshTokenPromise = null
const isPromisePending = function (p) {
  return p && typeof p === 'object' && typeof p.status === 'function' && p.status() === 'pending'
}
var refreshToken = function () {
  if (!config.userAuthenticationEnabled) {
    return Promise.resolve(true) // no-op if userAuthenticationEnabled == false
  }

  if (!isPromisePending(refreshTokenPromise)) {
    refreshTokenPromise = httpService.doGet(getServiceUrl() + 'user/refresh')
    refreshTokenPromise.then(({ data, headers }) => {
      setAuthParams(headers.get(TOKEN_HEADER), data.permissions)
    })
    refreshTokenPromise.catch(() => {
      resetAuthParams()
    })
  }

  return refreshTokenPromise
}

const isPermittedCreateConceptset = function () {
  return isPermitted('conceptset:post')
}

const isPermittedReadConceptsets = function () {
  return isPermitted('conceptset:get')
}

const isPermittedUpdateConceptset = function (conceptsetId) {
  return (isPermitted('conceptset:' + conceptsetId + ':put') && isPermitted('conceptset:' + conceptsetId + ':items:put')) || (isPermitted('conceptset:*:put') && isPermitted('conceptset:*:items:put'))
}

const isPermittedDeleteConceptset = function (id) {
  return isPermitted('conceptset:' + id + ':delete')
}

const isPermittedReadIRs = function () {
  return isPermitted('ir:get')
}

const isPermittedEditIR = function (id) {
  return isPermitted('ir:' + id + ':put')
}

const isPermittedCreateIR = function () {
  return isPermitted('ir:post')
}

const isPermittedDeleteIR = function (id) {
  return isPermitted('ir:' + id + ':delete')
}

const isPermittedCopyIR = function (id) {
  return isPermitted('ir:' + id + ':copy:get')
}

const isPermittedReadEstimations = function () {
  return isPermitted('comparativecohortanalysis:get')
}

const isPermittedEditSourcePriortiy = function () {
  return isPermitted('source:*:daimons:*:set-priority:post')
}

const isPermittedReadEstimation = function (id) {
  return isPermitted('comparativecohortanalysis:' + id + ':get')
}

const isPermittedCreateEstimation = function () {
  return isPermitted('comparativecohortanalysis:post')
}

const isPermittedDeleteEstimation = function (id) {
  return isPermitted(`comparativecohortanalysis:${id}:delete`)
}

const isPermittedReadPlps = function () {
  return isPermitted('plp:get')
}

const isPermittedCreatePlp = function () {
  return isPermitted('plp:post')
}

const isPermittedReadPlp = function (id) {
  return isPermitted('plp:' + id + ':get')
}

const isPermittedDeletePlp = function (id) {
  return isPermitted('plp:' + id + ':delete')
}

const isPermittedCopyPlp = function (id) {
  return isPermitted(`plp:${id}:copy:get`)
}

const isPermittedSearch = function () {
  return isPermitted('vocabulary:*:search:*:get')
}

const isPermittedViewCdmResults = function () {
  return isPermitted('cdmresults:*:get')
}

const isPermittedViewProfiles = function (sourceKey) {
  return isPermitted(`${sourceKey}:person:*:get`)
}

const isPermittedViewProfileDates = function () {
  return isPermitted('*:person:*:get:dates')
}

const isPermittedReadCohort = function (id) {
  return isPermitted('cohortdefinition:' + id + ':get') && isPermitted('cohortdefinition:sql:post')
}

const isPermittedReadCohorts = function () {
  return isPermitted('cohortdefinition:get')
}

const isPermittedCreateCohort = function () {
  return isPermitted('cohortdefinition:post')
}

const isPermittedCopyCohort = function (id) {
  return isPermitted('cohortdefinition:' + id + ':copy:get')
}

const isPermittedUpdateCohort = function (id) {
  const permission = 'cohortdefinition:' + id + ':put'
  return isPermitted(permission)
}

const isPermittedDeleteCohort = function (id) {
  const permission = 'cohortdefinition:' + id + ':delete'
  const allPermissions = 'cohortdefinition:delete'
  return isPermitted(permission) || isPermitted(allPermissions)
}

const isPermittedGenerateCohort = function (cohortId, sourceKey) {
  return isPermitted('cohortdefinition:' + cohortId + ':generate:' + sourceKey + ':get') &&
          isPermitted('cohortdefinition:' + cohortId + ':info:get')
}

const isPermittedReadCohortReport = function (cohortId, sourceKey) {
  return isPermitted('cohortdefinition:' + cohortId + ':report:' + sourceKey + ':get')
}

const isPermittedReadJobs = function () {
  return isPermitted('job:execution:get')
}

const isPermittedEditConfiguration = function () {
  return isPermitted('configuration:edit:ui')
}

const isPermittedCreateSource = function () {
  return isPermitted('source:post')
}

const isPermittedAccessSource = function (key) {
  return isPermitted('source:' + key + ':access')
}

const isPermittedReadSource = function (key) {
  return isPermitted('source:' + key + ':get')
}

const isPermittedCheckSourceConnection = function (key) {
  return isPermitted('source:connection:' + key + ':get')
}

const isPermittedEditSource = function (key) {
  return isPermitted('source:' + key + ':put')
}

const isPermittedDeleteSource = function (key) {
  return isPermitted('source:' + key + ':delete')
}

const isPermittedReadRoles = function () {
  return isPermitted('role:get')
}
const isPermittedReadRole = function (roleId) {
  const permitted =
              isPermitted('role:' + roleId + ':get') &&
              isPermitted('permission:get') &&
              isPermitted('role:' + roleId + ':permissions:get') &&
              isPermitted('user:get') &&
              isPermitted('role:' + roleId + ':users:get')
  return permitted
}
const isPermittedEditRole = function (roleId) {
  return isPermitted('role:' + roleId + ':put')
}
const isPermittedCreateRole = function () {
  return isPermitted('role:post')
}
const isPermittedDeleteRole = function (roleId) {
  return isPermitted('role:' + roleId + ':delete')
}
const isPermittedEditRoleUsers = function (roleId) {
  return isPermitted('role:' + roleId + ':users:*:put') && isPermitted('role:' + roleId + ':users:*:delete')
}
const isPermittedEditRolePermissions = function (roleId) {
  return isPermitted('role:' + roleId + ':permissions:*:put') && isPermitted('role:' + roleId + ':permissions:*:delete')
}
const isPermittedGetAllNotifications = function () {
  return isPermitted('notifications:get')
}
const isPermittedGetViewedNotifications = function () {
  return isPermitted('notifications:viewed:get')
}
const isPermittedPostViewedNotifications = function () {
  return isPermitted('notifications:viewed:post')
}
const isPermittedGetExecutionService = function () {
  return isPermitted('executionservice:*:get')
}
const isPermittedGetSourceDaimonPriority = function () {
  return isPermitted('source:daimon:priority:get')
}

const isPermittedImportUsers = function () {
  return isPermitted('user:import:post') && isPermitted('user:import:*:post')
}

const hasSourceAccess = function (sourceKey) {
  return isPermitted(`source:${sourceKey}:access`) || /* For 2.5.* and below */ isPermitted(`cohortdefinition:*:generate:${sourceKey}:get`)
}

const isPermittedClearServerCache = function (sourceKey) {
  return isPermitted('cache:clear:get')
}

const isPermittedTagsManagement = function () {
  return isPermitted('tag:management')
}

const isPermittedConceptSetAnnotationsDelete = function (conceptSetId) {
  return isPermitted('conceptset:' + conceptSetId + ':annotation:*:delete')
}

const isPermittedRunAs = () => isPermitted('user:runas:post')

const isPermittedViewDataSourceReport = sourceKey => isPermitted(`cdmresults:${sourceKey}:*:get`)

const isPermittedViewDataSourceReportDetails = sourceKey => isPermitted(`cdmresults:${sourceKey}:*:*:get`)

const setAuthParams = (tokenHeader, permissionsStr = '') => {
  !!tokenHeader && token(tokenHeader)
  !!permissionsStr && permissions(permissionsStr)
}

var resetAuthParams = function () {
  token(null)
  subject(null)
  permissions(null)
}

const runAs = function (login, success, error) {
  return $.ajax({
    method: 'POST',
    url: config.webAPIRoot + 'user/runas',
    data: {
      login,
    },
    success,
    error,
  })
}

const executeWithRefresh = async function (httpPromise) {
  const result = await httpPromise
  await refreshToken()
  return result
}

const api = {
  AUTH_PROVIDERS,
  AUTH_CLIENTS,

  token,
  authClient,
  reloginRequired,
  subject,
  fullName,
  tokenExpirationDate,
  tokenExpired,
  authProvider,
  setAuthParams,
  resetAuthParams,
  getAuthorizationHeader,
  handleAccessDenied,
  refreshToken,

  isAuthenticated,
  signInOpened,
  isPermitted,

  isPermittedGetAllNotifications,
  isPermittedGetViewedNotifications,
  isPermittedPostViewedNotifications,

  isPermittedCreateConceptset,
  isPermittedUpdateConceptset,
  isPermittedDeleteConceptset,
  isPermittedReadConceptsets,

  isPermittedReadCohorts,
  isPermittedReadCohort,
  isPermittedCreateCohort,
  isPermittedCopyCohort,
  isPermittedUpdateCohort,
  isPermittedDeleteCohort,
  isPermittedGenerateCohort,
  isPermittedReadCohortReport,

  isPermittedReadJobs,

  isPermittedEditConfiguration,
  isPermittedEditSourcePriority: isPermittedEditSourcePriortiy,

  isPermittedReadRoles,
  isPermittedReadRole,
  isPermittedEditRole,
  isPermittedCreateRole,
  isPermittedDeleteRole,
  isPermittedEditRoleUsers,
  isPermittedEditRolePermissions,

  isPermittedReadIRs,
  isPermittedCreateIR,
  isPermittedEditIR,
  isPermittedDeleteIR,
  isPermittedCopyIR,

  isPermittedReadEstimations,
  isPermittedReadEstimation,
  isPermittedCreateEstimation,
  isPermittedDeleteEstimation,

  isPermittedReadPlps,
  isPermittedReadPlp,
  isPermittedCreatePlp,
  isPermittedDeletePlp,
  isPermittedCopyPlp,

  isPermittedSearch,
  isPermittedViewCdmResults,
  isPermittedViewProfiles,
  isPermittedViewProfileDates,

  isPermittedAccessSource,
  isPermittedReadSource,
  isPermittedCreateSource,
  isPermittedEditSource,
  isPermittedDeleteSource,
  isPermittedCheckSourceConnection,
  isPermittedGetSourceDaimonPriority,

  isPermittedGetExecutionService,

  isPermittedImportUsers,
  hasSourceAccess,
  isPermittedRunAs,
  isPermittedTagsManagement,
  isPermittedClearServerCache,
  isPermittedViewDataSourceReport,
  isPermittedViewDataSourceReportDetails,

  isPermittedConceptSetAnnotationsDelete,

  loadUserInfo,
  TOKEN_HEADER,
  runAs,
  executeWithRefresh,

}

export default api
