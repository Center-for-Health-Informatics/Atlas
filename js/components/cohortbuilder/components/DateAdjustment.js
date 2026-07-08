import ko from 'knockout'
import componentTemplate from './DateAdjustmentTemplate.html?raw'
import DateAdjustment from '../InputTypes/DateAdjustment'

function DateAdjustmentViewModel (params) {
  const self = this
  self.DateAdjustment = params.DateAdjustment
  self.dateOptions = [
    {
      id: DateAdjustment.START_DATE,
      name: ko.i18n('options.startDate', 'start date'),
    },
    {
      id: DateAdjustment.END_DATE,
      name: ko.i18n('options.endDate', 'end date'),
    }
  ]
}

// return compoonent definition
export default {
  viewModel: DateAdjustmentViewModel,
  template: componentTemplate,
}
