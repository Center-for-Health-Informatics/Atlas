import ko from 'knockout'
import view from './job-scheduler.html?raw'
import AutoBind from 'utils/AutoBind'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import Const from '../const'
import './weekdays'
import './job-scheduler.less'

class JobScheduler extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.job = params.job || ko.observable({})
    this.weekdays = params.weekdays || ko.observableArray()
    this.jobEnds = params.jobEnds || ko.observable(Const.JobEndOptions.NEVER)
    this.jobEndOptions = Const.JobEndOptions
    this.executionOptions = Const.JobExecutionOptions
    this.weeklyVisible = ko.computed(() => this.job().frequency && this.job().frequency() === Const.JobExecution.WEEKLY)
    this.notOnceVisible = ko.computed(() => this.job().frequency && this.job().frequency() !== Const.JobExecution.ONCE)
  }
}

commonUtils.build('job-scheduler', JobScheduler, view)
