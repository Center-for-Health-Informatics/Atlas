import view from './WindowedCriteria.html?raw'
import Window from '../InputTypes/Window'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import utils from '../utils'
import options from '../options'
import './WindowedCriteria.less'

class WindowedCriteria extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.expression = params.expression
    this.criteria = params.criteria
    this.disableObservationPeriod = params.disableObservationPeriod || false
    if (this.disableObservationPeriod && params.defaultObservationPeriod) {
      this.criteria().IgnoreObservationPeriod(
        params.defaultObservationPeriod
      )
    }
    this.options = options
  }

  getCriteriaComponent (data) {
    return utils.getCriteriaComponent(data)
  }

  addEndWindow () {
    this.criteria().EndWindow(new Window({ UseEndWindow: true }))
  }

  removeEndWindow () {
    this.criteria().EndWindow(null)
  }
}

commonUtils.build('windowed-criteria', WindowedCriteria, view)
