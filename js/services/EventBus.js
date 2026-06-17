import ko from 'knockout'

class EventBus {
  constructor () {
    this.errorMsg = ko.observable()
  }
}

export default new EventBus()

