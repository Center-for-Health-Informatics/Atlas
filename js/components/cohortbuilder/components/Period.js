import ko from 'knockout'
import componentTemplate from './PeriodTemplate.html?raw'

function PeriodViewModel (params) {
  const self = this
  self.Period = params.Period // this will be a NumericRange input type.
}

// return compoonent definition
export default {
  viewModel: PeriodViewModel,
  template: componentTemplate,
}
