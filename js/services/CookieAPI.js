define(function (require, exports) {
  const jsCookie = require('js-cookie')

  function setField (field, value) {
    jsCookie.set(field, value, { expires: 365, path: '/' })
  }

  function clearField (field) {
    jsCookie.remove(field, { path: '/' })
  }

  const api = {
    setField,
    clearField,
  }

  return api
})
