define(function (require, exports) {
  const ko = require('knockout')

  const generateComponent = require('./components/GenerateComponent')
  ko.components.register('generate-component', generateComponent)

  const conceptSetBrowser = require('./components/ConceptSetBrowser')
  ko.components.register('concept-set-browser', conceptSetBrowser)
})
