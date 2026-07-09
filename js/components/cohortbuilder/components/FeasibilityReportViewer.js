import ko from 'knockout'
import template from './FeasibilityReportViewerTemplate.html?raw'
import './FeasibilityIntersectReport'
import './FeasibilityAttritionReport'
import '../css/report.css'

function FeasibilityReportViewer (params) {
  const self = this
  self.report = params.report
  self.reportType = params.reportType
  self.reportCaption = params.reportCaption
  self.selectedView = ko.observable('intersect')

  if (params.viewerWidget) {
    params.viewerWidget(self)
  }
}

const component = {
  viewModel: FeasibilityReportViewer,
  template,
}

ko.components.register('feasibility-report-viewer', component)

// return compoonent definition
export default component
