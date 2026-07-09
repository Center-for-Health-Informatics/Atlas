import ko from 'knockout'
import view from './explore-temporal.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import AutoBind from 'utils/AutoBind'
import 'components/tabs'
import './temporal/annual'
import './temporal/temporal'
import './explore-temporal.less'

class ExploreTemporal extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.tabs = [
      {
        title: 'Annual',
        key: 'annual',
        componentName: 'explore-temporal-annual',
        componentParams: { data: params.data.temporalAnnual },
        visible: () => params.data.temporalAnnual && params.data.temporalAnnual.length > 0
      }, {
        title: 'Daily',
        key: 'daily',
        componentName: 'explore-temporal-daily',
        componentParams: { data: params.data.temporalDaily },
        visible: () => params.data.temporalDaily && params.data.temporalDaily.length > 0
      },
    ].filter(v => v.visible())
    console.log(this.tabs)
    this.selectedTabKey = ko.observable(this.tabs.length > 0 ? this.tabs[0].key : null)
  }
}

commonUtils.build('explore-temporal', ExploreTemporal, view)
