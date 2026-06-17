import ko from 'knockout'
import componentTemplate from './DateAdjustmentTemplate.html?raw'
import DateAdjustment from 'components/cohortbuilder/InputTypes/DateAdjustment'

function DateAdjustmentViewModel (params) {
  const self = this
  self.DateAdjustment = params.DateAdjustment
  self.getFieldName = function (field) {
    switch (field) {
      case DateAdjustment.START_DATE:
        return ko.i18n('options.startDate', 'start date')
      case DateAdjustment.END_DATE:
        return ko.i18n('options.endDate', 'end date')
    }
  }
}

// return compoonent definition
export default {
  viewModel: DateAdjustmentViewModel,
  template: componentTemplate,
}

