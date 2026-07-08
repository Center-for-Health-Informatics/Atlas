import ko from 'knockout'
import view from './drug-util-detailed.html?raw'
import BaseDrugUtilReport from './base-drug-util-report'
import CohortResultsService from 'services/CohortResults'
import costUtilConst from 'pages/cohort-definitions/const'
import commonUtils from 'utils/CommonUtils'
import 'components/visualizations/filter-panel/filter-panel'
import './drug-util-detailed.less'

const componentName = 'cost-utilization-drug-detailed-util'

class DrugUtilDetailedReport extends BaseDrugUtilReport {
  constructor (params) {
    super(params)

    this.drugConceptId = params.drugConceptId()
    this.displaySummary = params.displaySummary

    this.drugsTableColumns = [
      {
        title: ko.i18n('columns.periodStart', 'Period start'),
        data: 'periodStart',
        className: this.classes('tbl-col', 'period-start'),
      },
      {
        title: ko.i18n('columns.periodEnd', 'Period end'),
        data: 'periodEnd',
        className: this.classes('tbl-col', 'period-end'),
      },
      ...this.drugsTableColumns,
    ]

    const chartList = this.drugsTableColumns.filter(item => item.showInChart)

    this.chartOptions = ko.observableArray(chartList.map(c => ({ label: c.title, value: c.title })))
    this.displayedCharts = ko.observableArray(this.chartOptions().map(o => o.value))

    this.init()
    this.setupChartsData(chartList)
    this.loadFilterOptions({ drugConceptId: this.drugConceptId })
  }

  getFilterList () {
    return [
      costUtilConst.getPeriodTypeFilter(this.periods),
      ...super.getFilterList(),
    ]
  }

  fetchAPI ({ filters }) {
    return CohortResultsService.loadDrugUtilDetailedReport({
      source: this.source,
      cohortId: this.cohortId,
      window: this.window,
      drugConceptId: this.drugConceptId,
      filters,
    })
      .then(({ data }) => this.dataList(data))
  }
}

export default commonUtils.build(componentName, DrugUtilDetailedReport, view)
