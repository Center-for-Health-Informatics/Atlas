import ko from 'knockout'
import view from './cohort-definition-browser.html?raw'
import EntityBrowser from 'components/entity-browser'
import commonUtils from 'utils/CommonUtils'
import CohortDefinitionService from 'services/CohortDefinition'
import authApi from 'services/AuthAPI'
import datatableUtils from 'utils/DatatableUtils'
import 'faceted-datatable'

class CohortDefinitionBrowser extends EntityBrowser {
  constructor (params) {
    super(params)
    this.showModal = params.showModal
    this.myDesignsOnly = params.myDesignsOnly || false
    this.data = ko.observableArray()
    const { pageLength, lengthMenu } = commonUtils.getTableOptions('M')
    this.pageLength = params.pageLength || pageLength
    this.lengthMenu = params.lengthMenu || lengthMenu

    this.options = {
      Facets: [
        {
          caption: ko.i18n('facets.caption.created', 'Created'),
          binding: (o) => datatableUtils.getFacetForDate(o.createdDate)
        },
        {
          caption: ko.i18n('facets.caption.updated', 'Updated'),
          binding: (o) => datatableUtils.getFacetForDate(o.modifiedDate)
        },
        {
          caption: ko.i18n('facets.caption.author', 'Author'),
          binding: datatableUtils.getFacetForCreatedBy,
        },
        {
          caption: ko.i18n('facets.caption.designs', 'Designs'),
          binding: datatableUtils.getFacetForDesign,
        },
      ]
    }

    this.columns = ko.observableArray([
      ...this.columns,
      {
        title: ko.i18n('columns.id', 'Id'),
        className: 'id-column',
        data: 'id'
      },
      {
        title: ko.i18n('columns.name', 'Name'),
        render: this.renderLink
          ? datatableUtils.getLinkFormatter(d => ({ label: d['name'], linkish: !this.multiChoice }))
          : (s, p, d) => `${d.name}`
      },
      {
        title: ko.i18n('columns.created', 'Created'),
        className: 'date-column',
        render: datatableUtils.getDateFieldFormatter('createdDate'),
      },
      {
        title: ko.i18n('columns.updated', 'Updated'),
        className: 'date-column',
        render: datatableUtils.getDateFieldFormatter('modifiedDate'),
      },
      {
        title: ko.i18n('columns.author', 'Author'),
        className: 'author-column',
        render: datatableUtils.getCreatedByFormatter(),
      }
    ])
  }

  async loadData () {
    try {
      this.isLoading(true)
      const data = await CohortDefinitionService.getCohortDefinitionList()
      const cohortList = ko.unwrap(this.myDesignsOnly)
        ? data.filter(c => c.hasWriteAccess || (c.createdBy && authApi.subject() === c.createdBy.login))
        : data
      datatableUtils.coalesceField(cohortList, 'modifiedDate', 'createdDate')
      datatableUtils.addTagGroupsToFacets(cohortList, this.options.Facets)
      datatableUtils.addTagGroupsToColumns(cohortList, this.columns)
      this.data(cohortList.map(item => ({ selected: ko.observable(this.selectedDataIds.includes(item.id)), ...item })))
    } catch (err) {
      console.error(err)
    } finally {
      this.isLoading(false)
    }
  }
}

export default commonUtils.build('cohort-definition-browser', CohortDefinitionBrowser, view)
