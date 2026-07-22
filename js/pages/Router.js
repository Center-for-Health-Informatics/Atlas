import pages from 'pages'
import authApi from 'services/AuthAPI'
import sharedState from 'atlas-state'
import ko from 'knockout'
import constants from 'const'
import EventBus from 'services/EventBus'
import { compileRoutes, matchRoute } from 'utils/HashRouter'

class AtlasRouter {
  constructor () {
    this.activeRoute = ko.observable({})
    this.currentView = ko.observable('loading')
    this.onLoginSubscription = undefined
    this.pages = Object.values(pages)
    this.routerParams = ko.observable()
    this.currentViewAccessible = ko.pureComputed(() => {
      return this.currentView && (
        sharedState.appInitializationStatus() !== constants.applicationStatuses.failed &&
        (sharedState.appInitializationStatus() !== constants.applicationStatuses.noSourcesAvailable ||
        ['ohdsi-configuration', 'source-manager'].includes(this.currentView())
        ))
    })
    this.currentView.subscribe(() => {
      EventBus.errorMsg(undefined)
    })
  }

  run () {
    this.compiledRoutes = compileRoutes(this.aggregateRoutes())
    window.addEventListener('hashchange', () => this.dispatch())

    // Mirrors director's own bootstrap: an empty hash gets set to '/' (which
    // fires 'hashchange' and dispatches asynchronously); a hash that's
    // already present (e.g. a bookmarked deep link) dispatches immediately,
    // since setting it to the same value wouldn't trigger a change event.
    if (this.isHashEmpty()) {
      window.location.hash = '/'
    } else {
      this.dispatch()
    }
  }

  isHashEmpty () {
    return window.location.hash === '' || window.location.hash === '#'
  }

  getPath () {
    const hash = window.location.hash.replace(/^#/, '')
    if (hash === '') {
      return '/'
    }
    return hash[0] === '/' ? hash : '/' + hash
  }

  dispatch () {
    const match = matchRoute(this.compiledRoutes, this.getPath())
    if (match) {
      match.handler(...match.captures)
    } else {
      this.handleNotFound()
    }
  }

  setRoute (path) {
    window.location.hash = path[0] === '/' ? path : '/' + path
  }

  qs () {
    return Object.fromEntries(new URLSearchParams(window.location.href.split('?')[1]))
  }

  handleNotFound () {
    this.setRoute('/search')
  }

  aggregateRoutes () {
    const routes = this.pages.reduce((routes, page) => {
      const pageRoutes = page.buildRoutes(this)
      for (const key in pageRoutes) {
        pageRoutes[key].title = page.title
      }
      return {
        ...routes,
        ...pageRoutes,
      }
    }, {})
    const routesWithRefreshedToken = Object.keys(routes).reduce((accumulator, key) => {
      accumulator[key] = (...args) => {
        sharedState.loading(true)
        if (this.onLoginSubscription) {
          this.onLoginSubscription.dispose()
        }
        const handler = routes[key].handler.bind(null, ...args)
        routes[key].checkPermission()
          .then(() => handler())
          .catch((ex) => {
            console.error(ex !== undefined ? ex : 'Permission error')
            // protected route didn't pass the token check -> show white page
            this.setCurrentView('white-page')
            // wait until user authenticates
            this.schedulePageUpdateOnLogin(handler)
          })
          .finally(() => {
            sharedState.loading(false)
          })

        this.activeRoute({
          handler,
          isSecured: routes[key].isSecured,
          title: routes[key].title,
        })
      }
      return accumulator
    }, {})
    // anyway, we should track the moment when the user exits and check permissions once again
    authApi.isAuthenticated.subscribe((isAuthenticated) => {
      const { isSecured, handler } = this.activeRoute()
      if (!isAuthenticated && isSecured) {
        this.setCurrentView('white-page')
        this.schedulePageUpdateOnLogin(handler)
      }
    })

    return routesWithRefreshedToken
  }

  schedulePageUpdateOnLogin (routeHandler) {
    this.onLoginSubscription = authApi.isAuthenticated.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        routeHandler()
        this.onLoginSubscription.dispose()
      }
    })
  }

  setCurrentView (view, routerParams = false) {
    if (view !== this.currentView()) {
      this.currentView('loading')
    }
    if (routerParams !== false) {
      this.routerParams(routerParams)
    }
    this.currentView(view)
  }
}
export default new AtlasRouter()
