import ko from 'knockout'
import view from './sql.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import globalConstants from 'const'
import AuthAPI from 'services/AuthAPI'
import './sql/sqlExportPanel'
import './sql.less'
import 'components/ac-access-denied'
import './sql/copyToClipboard'

class SqlExportUtil extends AutoBind(Component) {
  constructor (params) {
    super(params)

    this.selectedTabKey = ko.observable('templateSql')
    this.templateSql = ko.observable('')
    const { analysisId = 0, exportSqlService, expression = {}, isPermittedExport = () => false, } = params
    this.analysisId = analysisId
    this.exportSqlService = exportSqlService
    this.expression = expression
    this.isAuthenticated = AuthAPI.isAuthenticated()
    this.isPermittedExport = isPermittedExport
    this.loading = ko.observable()
    this.isExportPermitted = this.isExportPermittedResolver()
    this.canExport = ko.pureComputed(() => this.isExportPermitted())
    this.isDesignCorrect = ko.pureComputed(() => params.isDesignCorrect ? params.isDesignCorrect() : true)
    const componentParams = {
    }
    const sqlDialects = globalConstants.sqlDialects
    this.tabs = [
      {
        title: 'Template OHDSI.SQL',
        key: 'templateSql',
        componentName: 'sql-export-panel',
        componentParams: Object.assign({}, componentParams, { clipboardTarget: 'sqlText', sql: this.templateSql }),
      },
      ...Object.keys(sqlDialects).map(k => ({
        title: sqlDialects[k].title,
        key: k,
        componentName: 'sql-export-panel',
        componentParams: Object.assign({}, componentParams, { clipboardTarget: `${k}_sqlText`, dialect: sqlDialects[k].dialect, templateSql: this.templateSql }),
      })
      )]
    this.canExport() && this.loadSql()
    this.subscriptions = []
    this.subscriptions.push(this.expression.subscribe(v => !!v && this.loadSql()))
  }

  selectTab (index, { key }) {
    this.selectedTabKey(key)
  }

  isExportPermittedResolver () {
    return ko.pureComputed(() => this.isPermittedExport())
  }

  dispose () {
    this.subscriptions.forEach(s => s.dispose())
  }

  async loadSql () {
    if (this.analysisId() !== 0) {
      this.loading(true)
      try {
        const sql = await this.exportSqlService({
          analysisId: this.analysisId,
          expression: this.expression,
        })
        this.templateSql(sql && sql.templateSql)
      } finally {
        this.loading(false)
      }
    }
  }
}

export default commonUtils.build('export-sql', SqlExportUtil, view)
