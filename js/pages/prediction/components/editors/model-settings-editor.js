import ko from 'knockout'
import view from './model-settings-editor.html?raw'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import './modelSettings/naive-bayes-settings'
import './modelSettings/random-forest-settings'
import './modelSettings/mlp-settings'
import './modelSettings/knn-settings'
import './modelSettings/gradient-boosting-machine-settings'
import './modelSettings/decision-tree-settings'
import './modelSettings/ada-boost-settings'
import './modelSettings/lasso-logistic-regression-settings'

class ModelSettingsEditor extends Component {
  constructor (params) {
    super(params)

    this.editor = params.editor
    this.editorSettings = params
  }
}

export default commonUtils.build('model-settings-editor', ModelSettingsEditor, view)

