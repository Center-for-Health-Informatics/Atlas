const pageTitle = 'Profiles'
const paths = {
  source: sourceKey => `#/profiles/${sourceKey}`,
  person: (sourceKey, personId) => `#/profiles/${sourceKey}/${personId}`,
}

export { pageTitle, paths }
export default { pageTitle, paths }

