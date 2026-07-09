import ko from 'knockout'
import view from './temporal.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import AutoBind from 'utils/AutoBind'
import { formatNumeral } from 'utils/NumberFormatUtils'
import utils from '../utils'
import './temporal.less'

class ExploreTemporal extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.tableColumns = [
      {
        title: 'Start day',
        data: 'startDay',
        class: this.classes('col-start-day'),
      },
      {
        title: 'End day',
        data: 'endDay',
        class: this.classes('col-end-day'),
      },
      {
        title: 'Count',
        class: this.classes('col-count'),
        render: (s, p, d) => formatNumeral(d.count || 0),
      },
      {
        title: 'Pct',
        class: this.classes('col-pct'),
        render: (s, p, d) => {
          const pct = utils.formatPct((d.avg * 100) || 0)
          return `<div class="pct-fill" style="width: ${pct}"><div>${pct}</div></div>`
        },
      },
    ]
    this.tableOptions = { ...commonUtils.getTableOptions('M'), pageLength: 10 }

    this.temporal = params.data || []
    this.data = ko.observableArray(this.temporal)
  }
}

commonUtils.build('explore-temporal-daily', ExploreTemporal, view)
