function setField (field, value) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${field}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function clearField (field) {
  document.cookie = `${field}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

const api = {
  setField,
  clearField,
}

export default api
