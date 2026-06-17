import ko from 'knockout'
import sharedState from 'atlas-state'
import appConfig from 'appConfig'
import Page from 'pages/Page'
import momentApi from 'services/MomentAPI'
import URI from 'urijs'
import constants from 'const'

const build = function (name, viewModelClass, template) {
  const component = {
    viewModel: {
      createViewModel: (params, info) => {
        const vm = new viewModelClass(params, info)
        if (vm instanceof Page) {
          vm.onPageCreated()
        }

        return vm
      },
    },
    template,
  }
  viewModelClass.prototype.componentName = name

  ko.components.register(name, component)
  return component
}

const routeTo = function (path) {
  document.location = '#' + path
}

// service methods for model

function hasRelationship (concept, relationships) {
  for (let r = 0; r < concept.RELATIONSHIPS.length; r++) {
    for (let i = 0; i < relationships.length; i++) {
      if (concept.RELATIONSHIPS[r].RELATIONSHIP_NAME == relationships[i].name) {
        if (concept.RELATIONSHIPS[r].RELATIONSHIP_DISTANCE >= relationships[i].range[0] && concept.RELATIONSHIPS[r].RELATIONSHIP_DISTANCE <= relationships[i].range[1]) {
          if (relationships[i].vocabulary) {
            for (let v = 0; v < relationships[i].vocabulary.length; v++) {
              if (relationships[i].vocabulary[v] == concept.VOCABULARY_ID) {
                return true
              }
            }
          } else {
            return true
          }
        }
      }
    }
  }
  return false
}

function getConceptLinkClass (data) {
  let switchContext
  if (data.STANDARD_CONCEPT === undefined) {
    switchContext = data.concept.STANDARD_CONCEPT
  } else {
    switchContext = data.STANDARD_CONCEPT
  }
  switch (switchContext) {
    case 'N':
      return 'non-standard'
    case 'C':
      return 'classification'
    case 'S':
      return 'standard'
  }
}

function contextSensitiveLinkColor (row, data) {
  $('a', row)
    .addClass(getConceptLinkClass(data))
}

function highlightRow (row, cssClass) {
  $(row).addClass(cssClass)
}

function hasCDM (source) {
  return source.daimons.find(daimon => daimon.daimonType == 'CDM') !== undefined
}

function hasResults (source) {
  return source.daimons.find(daimon => daimon.daimonType == 'Results') !== undefined
}

function renderLink (s, p, d) {
  const valid = d.INVALID_REASON_CAPTION == 'Invalid' ? 'invalid' : ''
  const linkClass = getConceptLinkClass(d)
  return p === 'display'
    ? '<a class="' + valid + ' ' + linkClass + '" href=\"#/concept/' + d.CONCEPT_ID + '\">' + d.CONCEPT_NAME + '</a>'
    : d.CONCEPT_NAME
}

function renderBoundLink (s, p, d) {
  return renderLink(s, p, d.concept)
}

const renderConceptSelector = function (s, p, d) {
  let css = ''
  const icon = 'fa-shopping-cart'
  if (sharedState.selectedConceptsIndex[d.CONCEPT_ID] == 1) {
    css = ' selected'
  }
  return '<i class="fa ' + icon + ' ' + css + '"></i>'
}

const renderHierarchyLink = function (d) {
  const valid = d.INVALID_REASON_CAPTION == 'Invalid' || d.STANDARD_CONCEPT != 'S' ? 'invalid' : ''
  return '<a class="' + valid + '" href=\"#/concept/' + d.CONCEPT_ID + '\">' + d.CONCEPT_NAME + '</a>'
}

const syntaxHighlight = function (json) {
  if (typeof json !== 'string') {
    json = ko.toJSON(json, undefined, 2)
  }
  json = json.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'number'
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key'
      } else {
        cls = 'string'
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean'
    } else if (/null/.test(match)) {
      cls = 'null'
    }
    export default '<span class="' + cls + '">' + match + '</span>'
  })

