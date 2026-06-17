import ko from 'knockout'
import view from './job-history.html?raw'
import AutoBind from 'utils/AutoBind'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import jobService from '../services/JobService'
import datatableUtils from 'utils/DatatableUtils'
import utils from '../utils'
import './job-history.less'

class JobHistory extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.jobId = params.jobId
    this.job = params.job
    this.jobHistory = ko.observableArray()
    this.loading = ko.observable()
    this.tableOptions = commonUtils.getTableOptions('L')
    this.datatableUtils = datatableUtils
    this.loadHistory()
    this.jobId.subscribe(() => this.loadHistory())
    this.utils = utils
    this.messageModal = ko.observable()
    this.exitMessageItems = ko.observable()
  }

  loadHistory () {
    this.loading(true)
    jobService.getJobHistory(this.job().id)
      .then(res => this.jobHistory(res))
      .finally(() => this.loading(false))
  }

  onMessageClick (data) {
    if (data && data.exitMessage) {
      this.exitMessageItems(data.exitMessage.split(',').map(l => l.trim()))
      this.messageModal(true)
    }
  }
}

commonUtils.build('user-import-job-history', JobHistory, view)
