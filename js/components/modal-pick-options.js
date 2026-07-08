import ko from 'knockout'
import view from './modal-pick-options.html?raw'
import BemHelper from 'utils/BemHelper'
import './modal-pick-options.less'

const componentName = 'modal-pick-options'

function ModalPickOptions (params) {
  this.showModal = params.showModal
  this.title = params.title
  // options object looks like:
  // {
  //     section1: { title:'Section One Title', options: array, selectedOptions: observableArray }
  //     section2: { title:'Second Section Title', options: array, selectedOptions: observableArray }
  // }
  this.options = params.options
  this.submit = params.submit
  this.submitLabel = params.submitLabel

  const bemHelper = new BemHelper(componentName)
  this.classes = bemHelper.run.bind(bemHelper)
}

const component = {
  viewModel: ModalPickOptions,
  template: view
}

ko.components.register(componentName, component)
export default component
