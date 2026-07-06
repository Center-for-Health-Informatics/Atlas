import AuthAPI from 'services/AuthAPI'

function isPermittedList () {
  return AuthAPI.isPermitted('reusable:get')
}

function isPermittedCreate () {
  return AuthAPI.isPermitted('reusable:post')
}

function isPermittedUpdate (id) {
  return AuthAPI.isPermitted(`reusable:${id}:put`)
}

function isPermittedLoad (id) {
  return AuthAPI.isPermitted(`reusable:${id}:get`)
}

function isPermittedDelete (id) {
  return AuthAPI.isPermitted(`reusable:${id}:delete`)
}

function isPermittedCopy (id) {
  return AuthAPI.isPermitted(`reusable:${id}:post`)
}

export {
  isPermittedCreate,
  isPermittedCopy,
  isPermittedList,
  isPermittedLoad,
  isPermittedUpdate,
  isPermittedDelete,
}
export default { isPermittedCreate, isPermittedCopy, isPermittedList, isPermittedLoad, isPermittedUpdate, isPermittedDelete }
