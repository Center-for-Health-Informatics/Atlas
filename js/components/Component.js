import ko from 'knockout'
import BemHelper from 'utils/BemHelper'
import AuthAPI from 'services/AuthAPI'

class Component {
  constructor () {
    this.subscriptions = []
    const bemHelper = new BemHelper(this.componentName)
    this.classes = bemHelper.run.bind(bemHelper)
    this.isAuthenticated = AuthAPI.isAuthenticated
  }

  dispose () {
    this.subscriptions.forEach(sub => sub.dispose())
  }
}

export default Component

