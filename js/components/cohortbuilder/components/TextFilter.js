import ko from 'knockout'
import componentTemplate from './TextFilterTemplate.html?raw'

function TextFilterViewModel (params) {
  const self = this
  self.Filter = params.Filter // this will be a Text input type.

  self.operationOptions = [
    {
      id: 'startsWith',
      name: ko.i18n('components.textFilter.startsWith', 'Starting With'),
    },
    {
      id: 'contains',
      name: ko.i18n('components.textFilter.contains', 'Containing'),
    },
    {
      id: 'endsWith',
      name: ko.i18n('components.textFilter.endsWith', 'Ending With'),
    },
    {
      id: '!startsWith',
      name: ko.i18n('components.textFilter.notStartsWith', 'Not Starting With'),
    },
    {
      id: '!contains',
      name: ko.i18n('components.textFilter.notContains', 'Not Containing'),
    },
    {
      id: '!endsWith',
      name: ko.i18n('components.textFilter.notEndsWith', 'Not Ending With'),
    },
  ]
}

// return compoonent definition
export default {
  viewModel: TextFilterViewModel,
  template: componentTemplate,
}

