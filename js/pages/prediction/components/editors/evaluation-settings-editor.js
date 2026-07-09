import ko from 'knockout'
import view from './evaluation-settings-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import dataTypeConverterUtils from 'utils/DataTypeConverterUtils'
import constants from '../../const'
import 'databindings'

class EvaluationSettingsEditor extends Component {
  constructor (params) {
    super(params)

    this.isInteger = /^[1-9][0-9]*$/
    this.runPlpArgs = params.runPlpArgs()
    this.options = constants.options
    this.subscriptions = params.subscriptions
    this.splitSeed = ko.observable(this.runPlpArgs.splitSeed() !== null && this.runPlpArgs.splitSeed() !== 0 ? this.runPlpArgs.splitSeed() : '')
    this.testFraction = ko.observable(dataTypeConverterUtils.convertFromPercent(this.runPlpArgs.testFraction()))
    this.isEditPermitted = params.isEditPermitted

    this.subscriptions.push(this.splitSeed.subscribe(newValue => {
      if (newValue === '' || !this.isInteger.test(newValue)) {
        this.runPlpArgs.splitSeed(null)
        this.splitSeed('')
      } else {
        this.runPlpArgs.splitSeed(newValue)
      }
    }))

    this.subscriptions.push(this.testFraction.subscribe(newValue => {
      const val = dataTypeConverterUtils.convertToPercent(newValue)
      this.runPlpArgs.testFraction(val)
      this.testFraction(dataTypeConverterUtils.convertFromPercent(val))
    }))
  }
}

export default commonUtils.build('evaluation-settings-editor', EvaluationSettingsEditor, view)
