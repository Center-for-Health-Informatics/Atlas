import ko from 'knockout'
import view from './name-validation.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import constants from 'const'

class NameValidation extends Component {
  constructor (params) {
    super(params)
    this.maxEntityNameLength = constants.maxEntityNameLength
    this.hasEmptyName = params.hasEmptyName
    this.hasInvalidCharacters = params.hasInvalidCharacters
    this.hasInvalidLength = params.hasInvalidLength
    this.hasDefaultName = params.hasDefaultName
    this.defaultNameErrorText = ko.i18nformat('components.nameValidation.defaultName',
      'The name of the <%=analysisName%> should differ from the default one.',
      { analysisName: params.analysisName || 'analysis' })
  }
}

export default commonUtils.build('name-validation', NameValidation, view)

