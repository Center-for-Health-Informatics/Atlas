import atlasState from 'atlas-state'
import { AuthorizedRoute } from 'pages/Route'

function routes (router) {
  const JobViewEdit = new AuthorizedRoute((id, section) => {
    import('./users-import/job-view-edit').then(() => {
      router.setCurrentView('import-job-view-edit', {
        jobId: id,
        section,
      })
    })
  })
  return {
    '/configure': new AuthorizedRoute(() => {
      Promise.all([import('./configuration'), import('./sources/source-manager')]).then(() => {
        router.setCurrentView('ohdsi-configuration')
      })
    }),
    '/roles': new AuthorizedRoute(() => {
      import('./roles/roles').then(() => {
        router.setCurrentView('roles')
      })
    }),
    '/role/:id': new AuthorizedRoute((id) => {
      import('./roles/role-details').then(() => {
        const roleId = parseInt(id)
        router.setCurrentView('role-details', { roleId })
      })
    }),
    import: new AuthorizedRoute(() => {
      import('./users-import/browser').then(() => {
        router.setCurrentView('user-import-browser')
      })
    }),
    'import/job/:id:': JobViewEdit,
    'import/job/:id:/:section:': JobViewEdit,
    'import/wizard': new AuthorizedRoute(() => {
      import('./users-import/users-import').then(() => {
        router.setCurrentView('users-import')
      })
    }),
    'import/roles': new AuthorizedRoute(() => {
      import('./roles/role-import').then(() => {
        router.setCurrentView('role-import')
      })
    }),
    '/source/:id': new AuthorizedRoute((id) => {
      const sourceId = parseInt(id)
      import('./sources/source-manager').then(() => {
        atlasState.ConfigurationSource.selectedId(sourceId)
        router.setCurrentView('source-manager', { sourceId })
      })
    }),
    '/tag-management': new AuthorizedRoute(() => {
      import('./tag-management/tag-management').then(() => {
        router.setCurrentView('tag-management')
      })
    }),
  }
}

export default routes

