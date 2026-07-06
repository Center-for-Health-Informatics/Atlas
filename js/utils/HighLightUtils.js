import 'prism'
import 'prismlanguages/prism-sql'

function highlightJS (code, language) {
  if (!code) {
    return
  }
  if (typeof code === 'function') {
    return Prism.highlight(code(), Prism.languages[language], language)
  }
  return Prism.highlight(code, Prism.languages[language], language)
}

export default highlightJS

