import NaiveBayesSettings from './modelSettings/NaiveBayesSettings'
import RandomForestSettings from './modelSettings/RandomForestSettings'
import MLPSettings from './modelSettings/MLPSettings'
import KNNSettings from './modelSettings/KNNSettings'
import GradientBoostingMachineSettings from './modelSettings/GradientBoostingMachineSettings'
import DecisionTreeSettings from './modelSettings/DecisionTreeSettings'
import AdaBoostSettings from './modelSettings/AdaBoostSettings'
import LassoLogisticRegressionSettings from './modelSettings/LassoLogisticRegressionSettings'
import utils from '../utils'
import ko from 'knockout'

function GetSettingNameFromObject (data) {
  if (data.hasOwnProperty('NaiveBayesSettings')) {
    return 'NaiveBayesSettings'
  } else if (data.hasOwnProperty('RandomForestSettings')) {
    return 'RandomForestSettings'
  } else if (data.hasOwnProperty('MLPSettings')) {
    return 'MLPSettings'
  } else if (data.hasOwnProperty('KNNSettings')) {
    return 'KNNSettings'
  } else if (data.hasOwnProperty('GradientBoostingMachineSettings')) {
    return 'GradientBoostingMachineSettings'
  } else if (data.hasOwnProperty('DecisionTreeSettings')) {
    return 'DecisionTreeSettings'
  } else if (data.hasOwnProperty('AdaBoostSettings')) {
    return 'AdaBoostSettings'
  } else if (data.hasOwnProperty('LassoLogisticRegressionSettings')) {
    return 'LassoLogisticRegressionSettings'
  }
}

function GetSettingsFromObject (data) {
  switch (this.GetSettingNameFromObject(data)) {
    case 'NaiveBayesSettings':
      return {
        NaiveBayesSettings: new NaiveBayesSettings(
          data.NaiveBayesSettings
        ),
      }
    case 'RandomForestSettings':
      return {
        RandomForestSettings: new RandomForestSettings(
          data.RandomForestSettings
        ),
      }
    case 'MLPSettings':
      return {
        MLPSettings: new MLPSettings(data.MLPSettings),
      }
    case 'KNNSettings':
      return {
        KNNSettings: new KNNSettings(data.KNNSettings),
      }
    case 'GradientBoostingMachineSettings':
      return {
        GradientBoostingMachineSettings: new GradientBoostingMachineSettings(
          data.GradientBoostingMachineSettings
        ),
      }
    case 'DecisionTreeSettings':
      return {
        DecisionTreeSettings: new DecisionTreeSettings(
          data.DecisionTreeSettings
        ),
      }
    case 'AdaBoostSettings':
      return {
        AdaBoostSettings: new AdaBoostSettings(data.AdaBoostSettings),
      }
    case 'LassoLogisticRegressionSettings':
      return {
        LassoLogisticRegressionSettings: new LassoLogisticRegressionSettings(
          data.LassoLogisticRegressionSettings
        ),
      }
    default:
      console.error('Model Settings not found!')
      break
  }
}

function GetOptionsFromObject (data) {
  const settingName = this.GetSettingNameFromObject(data)
  return options.find((f) => f.key === settingName)
}

const options = [
  {
    key: 'LassoLogisticRegressionSettings',
    name: 'predictions.inputTypes.lassoLogisticRegression',
    defaultName: 'Lasso Logistic Regression',
    editor: 'lasso-logistic-regression-settings',
    action: () => {
      const defaultValues = utils.getDefaultModelSettingsValueList(
        'LassoLogisticRegressionSettings'
      )
      return {
        LassoLogisticRegressionSettings: new LassoLogisticRegressionSettings(
          defaultValues
        ),
      }
    },
  },
  {
    key: 'RandomForestSettings',
    name: 'predictions.inputTypes.randomForest',
    defaultName: 'Random Forest',
    editor: 'random-forest-settings',
    action: () => {
      const defaultValues = utils.getDefaultModelSettingsValueList(
        'RandomForestSettings'
      )
      return {
        RandomForestSettings: new RandomForestSettings(defaultValues),
      }
    },
  },
  {
    key: 'GradientBoostingMachineSettings',
    name: 'predictions.inputTypes.gradientBoostingMachine',
    defaultName: 'Gradient Boosting Machine',
    editor: 'gradient-boosting-machine-settings',
    action: () => {
      const defaultValues = utils.getDefaultModelSettingsValueList(
        'GradientBoostingMachineSettings'
      )
      return {
        GradientBoostingMachineSettings: new GradientBoostingMachineSettings(
          defaultValues
        ),
      }
    },
  },
  {
    key: 'AdaBoostSettings',
    name: 'predictions.inputTypes.adaBoost',
    defaultName: 'Ada Boost',
    editor: 'ada-boost-settings',
    action: () => {
      const defaultValues = utils.getDefaultModelSettingsValueList(
        'AdaBoostSettings'
      )
      return {
        AdaBoostSettings: new AdaBoostSettings(defaultValues),
      }
    },
  },
  {
    key: 'DecisionTreeSettings',
    name: 'predictions.inputTypes.decisionTree',
    defaultName: 'Decision Tree',
    editor: 'decision-tree-settings',
    action: () => {
      const defaultValues = utils.getDefaultModelSettingsValueList(
        'DecisionTreeSettings'
      )
      return {
        DecisionTreeSettings: new DecisionTreeSettings(defaultValues),
      }
    },
  },
  {
    key: 'NaiveBayesSettings',
    name: 'predictions.inputTypes.naiveBayes',
    defaultName: 'Naive Bayes',
    editor: 'naive-bayes-settings',
    action: () => {
      const defaultValues = utils.getDefaultModelSettingsValueList(
        'NaiveBayesSettings'
      )
      return {
        NaiveBayesSettings: new NaiveBayesSettings(defaultValues),
      }
    },
  },
  {
    key: 'MLPSettings',
    name: 'predictions.inputTypes.multilayerPerceptionModel',
    defaultName: 'Multilayer Perception Model',
    editor: 'mlp-settings',
    action: () => {
      const defaultValues = utils.getDefaultModelSettingsValueList(
        'MLPSettings'
      )
      return {
        MLPSettings: new MLPSettings(defaultValues),
      }
    },
  },
  {
    key: 'KNNSettings',
    name: 'predictions.inputTypes.nearestNeighbors',
    defaultName: 'K Nearest Neighbors',
    editor: 'knn-settings',
    action: () => {
      const defaultValues = utils.getDefaultModelSettingsValueList(
        'KNNSettings'
      )
      return {
        KNNSettings: new KNNSettings(defaultValues),
      }
    },
  },
]

const defaultModelSettings = [
  {
    name: 'RandomForestSettings',
    modelSettings: [
      {
        setting: 'maxDepth',
        name: ko.i18n('predictions.inputTypes.randomForestSettings.name_maxDepth', 'Max depth'),
        description: ko.i18n('predictions.inputTypes.randomForestSettings.desc_maxDepth', 'Maximum number of interactions - a large value will lead to slow model training'),
        defaultValue: [4, 10, 17],
      },
      {
        setting: 'mtries',
        name: ko.i18n('predictions.inputTypes.randomForestSettings.name_mtries', 'Number of tree features'),
        description: ko.i18n('predictions.inputTypes.randomForestSettings.desc_mtries', 'The number of features to include in each tree (-1 defaults to square root of total features)'),
        defaultValue: [-1],
      },
      {
        setting: 'ntrees',
        name: ko.i18n('predictions.inputTypes.randomForestSettings.name_ntrees', 'Number of tress to build'),
        description: ko.i18n('predictions.inputTypes.randomForestSettings.desc_ntrees', 'The number of trees to build'),
        defaultValue: [500],
      },
      {
        setting: 'varImp',
        name: ko.i18n('predictions.inputTypes.randomForestSettings.name_varImp', 'Perform an initial variable selection'),
        description: ko.i18n('predictions.inputTypes.randomForestSettings.desc_varImp', 'Perform an initial variable selection prior to fitting the model to select the useful variables'),
        defaultValue: [true],
      },
    ],
  },
  {
    name: 'NaiveBayesSettings',
    modelSettings: [],
  },
  {
    name: 'MLPSettings',
    modelSettings: [
      {
        setting: 'alpha',
        name: ko.i18n('predictions.inputTypes.mlpSettings.name_alpha', 'Alpha'),
        description: ko.i18n('predictions.inputTypes.mlpSettings.desc_alpha', 'The l2 regularisation'),
        defaultValue: [0.00001],
      },
      {
        setting: 'size',
        name: ko.i18n('predictions.inputTypes.mlpSettings.name_size', 'Number of hidden nodes'),
        description: ko.i18n('predictions.inputTypes.mlpSettings.desc_size', 'The number of hidden nodes'),
        defaultValue: [4],
      },
    ],
  },
  {
    name: 'KNNSettings',
    id: 4,
    modelSettings: [
      {
        setting: 'k',
        name: ko.i18n('predictions.inputTypes.knnSettings.name_k', 'Number of neighbors'),
        description: ko.i18n('predictions.inputTypes.knnSettings.desc_k', 'The number of neighbors to consider'),
        defaultValue: 1000,
      },
    ],
  },
  {
    name: 'GradientBoostingMachineSettings',
    modelSettings: [
      {
        setting: 'learnRate',
        name: ko.i18n('predictions.inputTypes.gradientBoostingMachineSettings.name_learnRate', 'Boosting learn rate'),
        description: ko.i18n('predictions.inputTypes.gradientBoostingMachineSettings.desc_learnRate', 'The boosting learn rate'),
        defaultValue: [0.01, 0.1],
      },
      {
        setting: 'maxDepth',
        name: ko.i18n('predictions.inputTypes.gradientBoostingMachineSettings.name_maxDepth', 'Maximum number of interactions'),
        description: ko.i18n('predictions.inputTypes.gradientBoostingMachineSettings.desc_maxDepth', 'Maximum number of interactions - a large value will lead to slow model training'),
        defaultValue: [4, 6, 17],
      },
      {
        setting: 'minRows',
        name: ko.i18n('predictions.inputTypes.gradientBoostingMachineSettings.name_minRows', 'Minimum number of rows'),
        description: ko.i18n('predictions.inputTypes.gradientBoostingMachineSettings.desc_minRows', 'The minimum number of rows required at each end node of the tree'),
        defaultValue: [20],
      },
      {
        setting: 'nthread',
        name: ko.i18n('predictions.inputTypes.gradientBoostingMachineSettings.name_nthread', 'Computer threads for computation'),
        description: ko.i18n('predictions.inputTypes.gradientBoostingMachineSettings.desc_nthread', 'The number of computer threads to use (how many cores do you have?)'),
        defaultValue: 20,
      },
      {
        setting: 'ntrees',
        name: ko.i18n('predictions.inputTypes.gradientBoostingMachineSettings.name_ntrees', 'Trees to build'),
        description: ko.i18n('predictions.inputTypes.gradientBoostingMachineSettings.desc_ntrees', 'The number of trees to build'),
        defaultValue: [10, 100],
      },
    ],
  },
  {
    name: 'DecisionTreeSettings',
    modelSettings: [
      {
        setting: 'classWeight',
        name: ko.i18n('predictions.inputTypes.decisionTreeSettings.name_classWeight', 'Class weight'),
        description: ko.i18n('predictions.inputTypes.decisionTreeSettings.desc_classWeight', 'Class weight'),
        defaultValue: ['None'],
      },
      {
        setting: 'maxDepth',
        name: ko.i18n('predictions.inputTypes.decisionTreeSettings.name_maxDepth', 'Max depth'),
        description: ko.i18n('predictions.inputTypes.decisionTreeSettings.desc_maxDepth', 'Maximum number of interactions - a large value will lead to slow model training'),
        defaultValue: [10],
      },
      {
        setting: 'minImpurityDecrease',
        name: ko.i18n('predictions.inputTypes.decisionTreeSettings.name_minImpurityDecrease', 'Minimum impurity split'),
        description: ko.i18n('predictions.inputTypes.decisionTreeSettings.desc_minImpurityDecrease', 'Threshold for early stopping in tree growth. A node will split if its impurity is above the threshold, otherwise it is a leaf.'),
        defaultValue: [0.0000001],
      },
      {
        setting: 'minSamplesLeaf',
        name: ko.i18n('predictions.inputTypes.decisionTreeSettings.name_minSamplesLeaf', 'Minimum samples per leaf'),
        description: ko.i18n('predictions.inputTypes.decisionTreeSettings.desc_minSamplesLeaf', 'The minimum number of samples per leaf'),
        defaultValue: [10],
      },
      {
        setting: 'minSamplesSplit',
        name: ko.i18n('predictions.inputTypes.decisionTreeSettings.name_minSamplesSplit', 'Minimum samples per split'),
        description: ko.i18n('predictions.inputTypes.decisionTreeSettings.desc_minSamplesSplit', 'The minimum samples per split'),
        defaultValue: [2],
      },
      {
        setting: 'plot',
        name: ko.i18n('predictions.inputTypes.decisionTreeSettings.name_plot', 'Minimum samples per split'),
        description: ko.i18n('predictions.inputTypes.decisionTreeSettings.desc_plot', 'The minimum samples per split'),
        defaultValue: false,
      },
    ],
  },
  {
    name: 'AdaBoostSettings',
    modelSettings: [
      {
        setting: 'learningRate',
        name: ko.i18n('predictions.inputTypes.adaBoostSettings.name_learningRate', 'Learning rate'),
        description: ko.i18n('predictions.inputTypes.adaBoostSettings.desc_learningRate', 'Learning rate shrinks the contribution of each classifier. There is a trade-off between learning rate and nEstimators.'),
        defaultValue: [1],
      },
      {
        setting: 'nEstimators',
        name: ko.i18n('predictions.inputTypes.adaBoostSettings.name_nEstimators', 'Maximum number of estimators'),
        description: ko.i18n('predictions.inputTypes.adaBoostSettings.desc_nEstimators', 'The maximum number of estimators at which boosting is terminated'),
        defaultValue: [50],
      },
    ],
  },
  {
    name: 'LassoLogisticRegressionSettings',
    modelSettings: [
      {
        setting: 'variance',
        name: ko.i18n('predictions.inputTypes.lassoLogisticRegressionSettings.name', 'Starting value for the automatic lambda search'),
        description: ko.i18n('predictions.inputTypes.lassoLogisticRegressionSettings.desc', 'A single value used as the starting value for the automatic lambda search'),
        defaultValue: 0.01,
      },
    ],
  },
]

export { NaiveBayesSettings, RandomForestSettings, MLPSettings, KNNSettings, GradientBoostingMachineSettings, DecisionTreeSettings, AdaBoostSettings, LassoLogisticRegressionSettings, utils, ko, GetSettingNameFromObject, GetSettingsFromObject, GetOptionsFromObject, options, defaultModelSettings }
export default { NaiveBayesSettings, RandomForestSettings, MLPSettings, KNNSettings, GradientBoostingMachineSettings, DecisionTreeSettings, AdaBoostSettings, LassoLogisticRegressionSettings, utils, ko, GetSettingNameFromObject, GetSettingsFromObject, GetOptionsFromObject, options, defaultModelSettings }
