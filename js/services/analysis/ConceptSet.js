import ko from 'knockout'

class ConceptSet {
  constructor (data = {}) {
    this.id = data.id || 0
    this.name = data.name || ''
  }
}

export default ConceptSet
