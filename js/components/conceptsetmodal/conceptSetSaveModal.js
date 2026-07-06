import ko from 'knockout'
import config from 'appConfig'
import authApi from 'services/AuthAPI'
import conceptSetService from 'services/ConceptSet'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import AutoBind from 'utils/AutoBind'
import view from './conceptSetSaveModal.html?raw'
import './style.css'

class ConceptSetSaveModal extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.conceptSetName = ko.pureComputed({
      read: () => params.conceptSetName(),
      write: name => {
        params.conceptSetName(name)
      }
    }).extend({ throttle: 500 })
    this.show = params.show
    this.fade = ko.observable(true)
    this.isOpened = ko.observable()
    this.onSave = () => {
      this.fade(false)
      this.show && this.show(false)
      this.isOpened(false)
      params.onSave()
    }

    this.subscriptions.push(
      this.conceptSetName.subscribe(name => {
        this.isOpened() && this.checkName()
      }),
      this.show.subscribe(isOpened => {
        this.isOpened(isOpened)
        if (isOpened) {
          this.checkName()
        }
      })
    )
    this.isNameUnique = ko.observable(false)

    this.canCreate = ko.pureComputed(() => (authApi.isAuthenticated() && authApi.isPermittedCreateConceptset()) || !config.userAuthenticationEnabled)
    this.canSave = ko.pureComputed(() => this.canCreate() && this.conceptSetName() && this.conceptSetName().length > 0 && this.isNameUnique())
  }

  async checkName () {
    try {
      const data = await conceptSetService.exists(this.conceptSetName() === undefined ? '' : this.conceptSetName(), 0)
      this.isNameUnique(parseInt(data) === 0)
    } catch (e) {
      this.isNameUnique(false)
    }
  }
}

export default commonUtils.build('conceptset-save', ConceptSetSaveModal, view)

