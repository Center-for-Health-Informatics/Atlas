const pageTitle = 'Home'

const releaseNotesUrl = (repo, tag = null) => `https://github.com/OHDSI/${repo}/releases` + (tag && tag !== '' && tag !== '*' ? `/tag/${tag}` : '')

export {
  pageTitle,
  releaseNotesUrl,
}
export default { pageTitle, releaseNotesUrl }
