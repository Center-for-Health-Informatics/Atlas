import ko from 'knockout'
import view from './treemap.html?raw'
import TreemapReport from 'components/reports/classes/Treemap'
import Component from 'components/Component'
import constants from 'components/reports/const'
import commonUtils from 'utils/CommonUtils'
import 'components/heading'
import 'components/charts/treemap'
import 'components/reports/reportDrilldown'

class Drug extends TreemapReport {
  constructor (params) {
    super(params)

    this.name = 'Drug' // header

    this.byFrequency = true
    this.byType = true
    this.chartFormats.table.columns.splice(1, 0,
      {
        title: ko.i18n('columns.ingredient', 'Ingredient'),
        data: 'ingredient',
        className: 'treemap__tbl-col--medium'
      })
  }

  get aggProperty () {
    return constants.aggProperties.byPerson
  }
}

export default commonUtils.build('report-drug', Drug, view)
