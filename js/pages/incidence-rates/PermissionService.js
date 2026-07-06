import AuthAPI from 'services/AuthAPI'

function isPermittedExportSQL () {
  return AuthAPI.isPermitted('ir:sql:post')
}

export {
  isPermittedExportSQL,
}

