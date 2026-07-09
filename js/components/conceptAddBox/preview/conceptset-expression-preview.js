import ko from 'knockout'
import view from './conceptset-expression-preview.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import renderers from 'utils/Renderers'
import 'components/conceptLegend/concept-legend'

class ConceptsetExpressionPreview extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.conceptSetItems = params.conceptSetItems

    this.commonUtils = commonUtils
    this.allExcludedChecked = ko.pureComputed(() => {
      return this.conceptSetItems().find(item => !item.isExcluded()) === undefined
    })
    this.allDescendantsChecked = ko.pureComputed(() => {
      return this.conceptSetItems().find(item => !item.includeDescendants()) === undefined
    })
    this.allMappedChecked = ko.pureComputed(() => {
      return this.conceptSetItems().find(item => !item.includeMapped()) === undefined
    })

    this.datatableLanguage = ko.i18n('datatable.language')

    this.data = ko.pureComputed(() => this.conceptSetItems().map((item, idx) => ({
      ...item,
      idx,
      isSelected: ko.observable()
    })))

    this.tableOptions = params.tableOptions || commonUtils.getTableOptions('M')
    this.columns = [
      {
        data: 'concept.CONCEPT_ID',
      },
      {
        data: 'concept.CONCEPT_CODE',
      },
      {
        render: commonUtils.renderBoundLink,
      },
      {
        data: 'concept.DOMAIN_ID',
      },
      {
        data: 'concept.STANDARD_CONCEPT',
        visible: false,
      },
      {
        data: 'concept.STANDARD_CONCEPT_CAPTION',
      },
      {
        class: 'text-center',
        orderable: false,
        render: () => this.renderCheckbox('isExcluded'),
      },
      {
        class: 'text-center',
        orderable: false,
        render: () => this.renderCheckbox('includeDescendants'),
      },
      {
        class: 'text-center',
        orderable: false,
        render: () => this.renderCheckbox('includeMapped'),
      },
    ]
  }

  renderCheckbox (field) {
    return renderers.renderConceptSetCheckbox(ko.observable(true), field)
  }

  toggleExcluded () {
    this.selectAllConceptSetItems('isExcluded', this.allExcludedChecked())
  }

  toggleDescendants () {
    this.selectAllConceptSetItems('includeDescendants', this.allDescendantsChecked())
  }

  toggleMapped () {
    this.selectAllConceptSetItems('includeMapped', this.allMappedChecked())
  }

  async selectAllConceptSetItems (key, areAllSelected) {
    this.conceptSetItems().forEach(conceptSetItem => {
      conceptSetItem[key](!areAllSelected)
    })
  }
}

export default commonUtils.build('conceptset-expression-preview', ConceptsetExpressionPreview, view)
