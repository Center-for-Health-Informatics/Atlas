import ko from 'knockout'
import consts from '../const'

const ImportComponent = (C = class {}) => class extends C {
  constructor (params) {
    super(params)
    this.importing = params.importing || ko.observable(false)
    this.selectedTabKey = params.selectedTabKey || ((mode) => null)
  }

  async doImport (options) {
    this.importing(true)
    try {
      await this.runImport(options)
      this.selectedTabKey(consts.ViewMode.EXPRESSION)
    } finally {
      this.importing(false)
    }
  }
}

export default ImportComponent

