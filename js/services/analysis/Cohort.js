import ko from 'knockout'

class Cohort {
  constructor (data = {}) {
    this.id = data.id || 0
    this.name = data.name || ''
  }
}

export default Cohort

