define(function (require, exports) {
  const ko = require('knockout')

  const evidencePairViewer = require('./components/evidence-pair-viewer')
  ko.components.register('evidence-pair-viewer', evidencePairViewer)

  const negativeControls = require('./components/negative-controls')
  ko.components.register('negative-controls', negativeControls)
})
