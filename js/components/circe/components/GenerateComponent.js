import ko from 'knockout'
import template from './GenerateComponentTemplate.html?raw'

function GenerateComponentViewModel (params) {
  const self = this
  self.info = params.info
  self.dirtyFlag = params.dirtyFlag
  self.source = params.source
  self.isRunning = ko.pureComputed(function () {
    return (self.info() && self.info().status != 'COMPLETE')
  })
}

// return compoonent definition
export { GenerateComponentViewModel, template }
export default { viewModel: GenerateComponentViewModel, template }

