import ko from 'knockout'
import componentTemplate from './TextFilterTemplate.html?raw'

function TextFilterViewModel (params) {
  const self = this
  self.Filter = params.Filter // this will be a Text input type.

  self.operationOptions = [{
    id: 'startsWith',
    name: ko.i18n('options.startsWith', 'starting with')
  }, {
    id: 'contains',
    name: ko.i18n('options.contains', 'containing')
  }, {
    id: 'endsWith',
    name: ko.i18n('options.endsWith', 'ending with')
  }, {
    id: '!startsWith',
    name: ko.i18n('options.notStartsWith', 'not starting with')
  }, {
    id: '!contains',
    name: ko.i18n('options.notContains', 'not containing')
  }, {
    id: '!endsWith',
    name: ko.i18n('options.notEndsWith', 'not ending with')
  }]

  self.opName = ko.pureComputed(function () {
    return self.operationOptions.filter(function (item) {
      return item.id == ko.utils.unwrapObservable(ko.utils.unwrapObservable(self.Filter).Op)
    })[0].name
  })
};

// return compoonent definition
export default {
  viewModel: TextFilterViewModel,
  template: componentTemplate
}
