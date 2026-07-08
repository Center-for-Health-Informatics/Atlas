import ko from 'knockout'
import view from './table-baseline-exposure.html?raw'
import BaseCostUtilReport from 'pages/cohort-definitions/components/reporting/cost-utilization/base-report'
import commonUtils from 'utils/CommonUtils'
import './table-baseline-exposure.less'

const componentName = 'table-baseline-exposure'

class TableBaselineExposure extends BaseCostUtilReport {
  constructor (params) {
    super(params)
    this.columns = [
      {
        title: ko.i18n('columns.periodStart', 'Period start'),
        data: 'periodStart',
        className: this.classes('period-start'),
      },
      {
        title: ko.i18n('columns.periodEnd', 'Period end'),
        data: 'periodEnd',
        className: this.classes('period-end'),
      },
      {
        title: ko.i18n('columns.personsCount', 'Persons'),
        data: 'personsCount',
        className: this.classes('persons-count'),
        render: BaseCostUtilReport.formatFullNumber,
      },
      {
        title: ko.i18n('columns.personsPct', 'Persons %'),
        data: 'personsPct',
        className: this.classes('persons-pct'),
        render: BaseCostUtilReport.formatPercents,
        yFormat: BaseCostUtilReport.formatPercents,
      },
      {
        title: ko.i18n('columns.exposureTotal', 'Total Exposure in Years'),
        data: 'exposureTotal',
        className: this.classes('exposure-total'),
        render: BaseCostUtilReport.formatFullNumber,
      },
      {
        title: ko.i18n('columns.exposurePct', 'Percent Exposed'),
        data: 'exposurePct',
        className: this.classes('exposure-pct'),
        render: BaseCostUtilReport.formatPercents,
        yFormat: BaseCostUtilReport.formatPercents,
      },
      {
        title: ko.i18n('columns.exposureAvg', 'Average Exposure Years per 1,000 persons'),
        data: 'exposureAvg',
        className: this.classes('exposure-avg'),
        render: BaseCostUtilReport.formatFullNumber,
      },
    ]
    this.dataList = params.dataList
  }
}

export default commonUtils.build(componentName, TableBaselineExposure, view)
