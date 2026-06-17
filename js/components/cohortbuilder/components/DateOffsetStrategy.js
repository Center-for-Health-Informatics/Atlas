import ko from 'knockout'
import template from './DateOffsetStrategyTemplate.html?raw'
import options from '../options'

function DateOffsetStrategyViewModel (params) {
  const self = this
  self.options = options

  self.strategy = ko.pureComputed(function () {
    return ko.utils.unwrapObservable(params.strategy).DateOffset
  })

  self.fieldOptions = [
    { id: 'StartDate', name: ko.i18n('options.startDate', 'start date') },
    { id: 'EndDate', name: ko.i18n('options.endDate', 'end date') },
  ]
}

// return compoonent definition
export default {
  viewModel: DateOffsetStrategyViewModel,
  template,
}

