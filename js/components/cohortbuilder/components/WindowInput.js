import ko from 'knockout'
import options from '../options'
import template from './WindowInputTemplate.html?raw'
import 'databindings'

function WindowInputViewModel (params) {
  const self = this
  self.options = options
  self.Window = ko.utils.unwrapObservable(params.Window) // this will be a Window input type.
}

// return compoonent definition
export { WindowInputViewModel, template }
export default { viewModel: WindowInputViewModel, template }

