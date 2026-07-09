import ko from 'knockout'
import options from 'components/cohortbuilder/options'
import template from './WindowInputTemplate.html?raw'

function WindowInputViewModel (params) {
  const self = this
  self.options = options
  self.Window = ko.utils.unwrapObservable(params.Window) // this will be a Window input type.

  self.getCoeffName = function (coeffId) {
    return self.options.windowCoeffOptions.filter(function (item) {
      return item.value === coeffId
    })[0].name
  }
}

// return compoonent definition
export { WindowInputViewModel, template }
export default { viewModel: WindowInputViewModel, template }
