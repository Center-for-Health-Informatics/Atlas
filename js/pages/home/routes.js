import { Route } from 'pages/Route'
import authApi from 'services/AuthAPI'

function routes (router) {
  return {
    '/': new Route(() => {
      document.location = '#/home'
    }),
    '/home': new Route(() => {
      import('./home').then(() => {
        router.setCurrentView('home')
      })
    }),
    '/welcome/:authClient/reloginRequired': new Route((authClient) => {
      import('welcome').then(() => {
        setAuth(null, authClient, true, '/welcome')
      })
    }),
    '/welcome/:authClient/:token': new Route((authClient, token) => {
      import('welcome').then(() => {
        setAuth(token, authClient, false, '/welcome')
      })
    }),
    '/welcome/:authClient/:token/:url': new Route((authClient, token, url) => {
      Promise.resolve().then(() => {
        setAuth(token, authClient, false, decodeURIComponent(url))
      })
    }),
  }
}

function setAuth (token, authClient, reloginRequired, url) {
  authApi.token(token)
  authApi.reloginRequired(reloginRequired)
  authApi.authClient(authClient)
  if (!reloginRequired) {
    authApi.loadUserInfo().then(() => {
      document.location = '#' + url
    })
  } else {
    authApi.signInOpened(true)
    document.location = '#' + url
  }
}

export default routes

