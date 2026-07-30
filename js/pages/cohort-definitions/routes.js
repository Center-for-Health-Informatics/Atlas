import { AuthorizedRoute } from 'pages/Route'
import sharedState from 'atlas-state'

// The module set behind the cohort definition editor, shared by every route
// that renders `cohort-definition-manager`. It lives in one place because it
// used to be copy-pasted per route, and the drift is what left four modules
// both statically and dynamically imported -- Rollup then warns
// INEFFECTIVE_DYNAMIC_IMPORT and cannot split them out. See MIGRATION_STATUS.md.
//
// Leaf Knockout components are deliberately absent here. Each registers itself
// with `ko.components.register` at module scope, and reaches the page through
// its parent component's static import (`conceptset-list` -> `expression` ->
// `conceptset-editor`, `included` -> `concept-modal`), which is the convention
// everywhere else in js/components. Listing them again as dynamic imports buys
// nothing and entangles their chunks.
const loadCohortEditor = () => Promise.all([
  import('components/cohortbuilder/CohortDefinition'),
  import('components/atlas.cohort-editor'),
  import('./cohort-definitions'),
  import('./cohort-definition-manager'),
  import('components/explore-cohort'),
])

function routes (router) {
  return {
    '/cohortdefinitions': new AuthorizedRoute(() => {
      Promise.all([import('./cohort-definitions'), import('./cohort-definition-manager')]).then(() => {
        router.setCurrentView('cohort-definitions')
      })
    }),

    '/cohortdefinition/:cohortDefinitionId/samples': new AuthorizedRoute(
      cohortDefinitionId => {
        loadCohortEditor().then(() => {
        // not re-render component if it was rendered already
          router.setCurrentView('cohort-definition-manager', {
            cohortDefinitionId,
            mode: 'samples',
          })
          sharedState.CohortDefinition.mode('samples')
        })
      }
    ),

    '/cohortdefinition/:cohortDefinitionId/samples/:sourceKey': new AuthorizedRoute(
      (cohortDefinitionId, sourceKey) => {
        loadCohortEditor().then(() => {
          router.setCurrentView('cohort-definition-manager', {
            cohortDefinitionId,
            sourceKey,
            mode: 'samples',
          })
          sharedState.CohortDefinition.mode('samples')
        })
      }
    ),

    '/cohortdefinition/:cohortDefinitionId/samples/:sourceKey/:sampleId': new AuthorizedRoute(
      (cohortDefinitionId, sourceKey, sampleId) => {
        loadCohortEditor().then(() => {
          router.setCurrentView('cohort-definition-manager', {
            cohortDefinitionId,
            sampleId,
            sourceKey,
            mode: 'samples',
          })
          sharedState.CohortDefinition.mode('samples')
        })
      }
    ),

    '/cohortdefinition/:cohortDefinitionId/conceptsets/:conceptSetId/:mode': new AuthorizedRoute(
      (cohortDefinitionId, conceptSetId, mode) => {
        // `sharedState.activeConceptSet` is primed by
        // cohort-definition-manager's `loadConceptSet`, which is the single
        // funnel for a route-supplied conceptSetId.
        loadCohortEditor().then(() => {
          sharedState.CohortDefinition.mode('conceptsets')
          router.setCurrentView('cohort-definition-manager', {
            cohortDefinitionId,
            mode: 'conceptsets',
            conceptSetId,
          })
        })
      }),

    '/cohortdefinition/:cohortDefinitionId/version/:version': new AuthorizedRoute(
      (cohortDefinitionId, version) => {
        loadCohortEditor().then(() => {
          router.setCurrentView('cohort-definition-manager', {
            cohortDefinitionId,
            version,
            mode: 'definition',
          })
          sharedState.CohortDefinition.mode('definition')
        })
      }
    ),

    // eslint-disable-next-line no-useless-escape -- this route pattern is compiled into a RegExp by director; \w must be preserved
    '/cohortdefinition/:cohortDefinitionId:/?((\w|.)*)': new AuthorizedRoute((cohortDefinitionId, path = 'definition') => {
      loadCohortEditor().then(() => {
        // Determine the view to show on the cohort manager screen based on the path
        path = path.split('/')
        let view = 'definition'
        if (path.length > 0 && path[0] !== '') {
          view = path[0]
        }
        let selectedSourceId = null
        if (path.length > 1 && path[1] !== '') {
          selectedSourceId = parseInt(path[1])
        }
        // Determine any optional parameters to set based on the query string
        const qs = router.qs() // Get the query string parameters
        const sourceKey = qs.sourceKey || null
        router.setCurrentView('cohort-definition-manager', {
          cohortDefinitionId,
          selectedSourceId,
          mode: view,
          sourceKey,
        })
        sharedState.CohortDefinition.mode(view)
      })
    }),

    '/reports': new AuthorizedRoute(() => {
      // `report-manager` arrives with the manager, whose template binds the tag
      import('./cohort-definition-manager').then(() => {
        router.setCurrentView('report-manager')
      })
    }),
  }
}

export default routes
