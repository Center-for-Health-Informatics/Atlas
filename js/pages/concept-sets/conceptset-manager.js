import ko from 'knockout'
import view from './conceptset-manager.html?raw'
import Page from 'pages/Page'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import config from 'appConfig'
import constants from './const'
import globalConstants from 'const'
import utils from 'components/conceptset/utils'
import vocabularyAPI from 'services/Vocabulary'
import GlobalPermissionService from 'services/Permission'
import TagsService from 'services/Tags'
import { entityType } from 'components/security/access/const'
import ConceptSet from 'components/conceptset/InputTypes/ConceptSet'
import ConceptSetItem from 'components/conceptset/InputTypes/ConceptSetItem'
import sharedState from 'atlas-state'
import conceptSetService from 'services/ConceptSet'
import ConceptSetStore from 'components/conceptset/ConceptSetStore'
import conceptSetUtils from 'components/conceptset/utils'
import authApi from 'services/AuthAPI'
import lodash from 'lodash'
import 'databindings'
import 'bootstrap'
import 'faceted-datatable'
import 'databindings'
import 'evidence'
import 'circe'
import 'conceptset-modal'
import './conceptset-manager.less'
import 'components/heading'
import 'components/tabs'
import 'components/modal'
import './components/tabs/conceptset-expression'
import 'components/conceptset/included'
import 'components/conceptset/included-sourcecodes'
import 'components/conceptset/recommend'
import 'components/conceptset/import'
import 'components/conceptset/export'
import './components/tabs/explore-evidence'
import './components/tabs/conceptset-compare'
import 'components/security/access/configure-access-modal'
import 'components/tags/modal/tags-modal'
import 'components/authorship'
import 'components/name-validation'
import 'components/ac-access-denied'
import 'components/versions/versions'
import './components/tabs/conceptset-annotation'
import './components/tabs/resolve-mappings'

const { ViewMode, RESOLVE_OUT_OF_ORDER } = constants

class ConceptsetManager extends AutoBind(Page) {
  constructor (params) {
    super(params)
    this.commonUtils = commonUtils
    this.conceptSetStore = ConceptSetStore.repository()
    this.selectedSource = ko.observable()
    this.currentConceptSet = ko.pureComputed(() => this.conceptSetStore.current())
    this.previewVersion = sharedState.currentConceptSetPreviewVersion
    this.currentConceptSetDirtyFlag = sharedState.RepositoryConceptSet.dirtyFlag
    this.currentConceptSetMode = sharedState.currentConceptSetMode
    this.isOptimizeModalShown = ko.observable(false)
    this.defaultName = ko.unwrap(globalConstants.newEntityNames.conceptSet)
    this.loading = ko.observable()
    this.optimizeLoading = ko.observable()
    this.fade = ko.observable(false)

    this.canEdit = ko.pureComputed(() => {
      if (!authApi.isAuthenticated()) {
        return false
      }

      if (this.currentConceptSet() && (this.currentConceptSet()
        .id !== 0)) {
        return authApi.isPermittedUpdateConceptset(this.currentConceptSet()
          .id) || !config.userAuthenticationEnabled
      } else {
        return authApi.isPermittedCreateConceptset() || !config.userAuthenticationEnabled
      }
    })
    this.isNameFilled = ko.computed(() => {
      return this.currentConceptSet() && this.currentConceptSet().name() && this.currentConceptSet().name().trim()
    })
    this.isNameCharactersValid = ko.computed(() => {
      return this.isNameFilled() && commonUtils.isNameCharactersValid(this.currentConceptSet().name())
    })
    this.isNameLengthValid = ko.computed(() => {
      return this.isNameFilled() && commonUtils.isNameLengthValid(this.currentConceptSet().name())
    })
    this.isDefaultName = ko.computed(() => {
      return this.isNameFilled() && this.currentConceptSet().name().trim() === this.defaultName
    })
    this.isNameCorrect = ko.computed(() => {
      return this.isNameFilled() && !this.isDefaultName() && this.isNameCharactersValid() && this.isNameLengthValid()
    })
    this.canSave = ko.computed(() => {
      return (
        !this.loading() &&
			this.currentConceptSet() != null &&
			(this.currentConceptSetDirtyFlag().isDirty() || this.previewVersion()) &&
			this.isNameCorrect() &&
			this.canEdit()
      )
    })
    this.canCreate = ko.computed(() => {
      return authApi.isPermittedCreateConceptset()
    })
    this.hasAccess = authApi.isPermittedReadConceptsets
    this.hasPrioritySourceAccess = ko.observable(true)
    this.isAuthenticated = authApi.isAuthenticated
    this.conceptSetCaption = ko.computed(() => {
      if (this.currentConceptSet()) {
        if (this.currentConceptSet().id === 0) {
          return globalConstants.newEntityNames.conceptSet()
        } else if (this.previewVersion()) {
          return ko.i18nformat('cs.manager.captionPreview', 'Concept Set #<%=id%> - Version <%=number%> Preview', { id: this.currentConceptSet().id, number: this.previewVersion().version })()
        } else {
          return ko.i18nformat('cs.manager.caption', 'Concept Set #<%=id%>', { id: this.currentConceptSet().id })()
        }
      }
    })
    this.canDelete = ko.pureComputed(() => {
      if (!config.userAuthenticationEnabled) {
        return true
      }
      return this.conceptSetStore.current() && authApi.isPermittedDeleteConceptset(this.conceptSetStore.current().id)
    })

    this.canDeleteAnnotations = ko.pureComputed(() => {
      if (!config.userAuthenticationEnabled) {
        return true
      }
      return this.conceptSetStore.current() && authApi.isPermittedConceptSetAnnotationsDelete(this.conceptSetStore.current().id)
    })

    this.canOptimize = ko.computed(() => {
      return (
        this.currentConceptSet() &&
			this.currentConceptSet().id != 0 &&
			this.currentConceptSet().expression.items().length > 1 &&
			this.canCreate() &&
			this.canEdit()
      )
    })
    this.optimalConceptSet = ko.observable(null)
    this.optimizerRemovedConceptSet = ko.observable(null)
    this.optimizerSavingNew = ko.observable(false)
    this.optimizerSavingNewName = ko.observable()
    this.optimizerFoundSomething = ko.pureComputed(() => {
      let returnVal = false
      if (this.optimalConceptSet() &&
			this.optimalConceptSet().length > 0 &&
			this.currentConceptSet() && this.currentConceptSet().expression.items() &&
			this.currentConceptSet().expression.items().length > 0) {
        returnVal = this.optimalConceptSet().length != this.currentConceptSet().expression.items().length
      }
      return returnVal
    })
    this.saveConceptSetShow = ko.observable(false)
    this.canCopy = ko.computed(() => {
      return this.currentConceptSet() && this.currentConceptSet().id > 0
    })
    this.enablePermissionManagement = config.enablePermissionManagement
    this.isSaving = ko.observable(false)
    this.isDeleting = ko.observable(false)
    this.isOptimizing = ko.observable(false)
    this.isProcessing = ko.computed(() => {
      return this.isSaving() || this.isDeleting() || this.isOptimizing()
    })
    this.optimizeTableOptions = commonUtils.getTableOptions('M')
    const tableOptions = commonUtils.getTableOptions('L')

    this.isDiagnosticsRunning = ko.observable(false)
    this.criticalCount = ko.observable(0)

    this.versionsParams = ko.observable({
      versionPreviewUrl: (versionNumber) => `/conceptset/${this.currentConceptSet().id}/version/${versionNumber}`,
      currentVersion: () => this.currentConceptSet(),
      previewVersion: () => this.previewVersion(),
      getList: () => this.currentConceptSet().id ? conceptSetService.getVersions(this.currentConceptSet().id) : [],
      updateVersion: (version) => conceptSetService.updateVersion(version),
      copyVersion: async (version) => {
        this.loading(true)
        try {
          const result = await conceptSetService.copyVersion(this.currentConceptSet().id, version.version)
          this.previewVersion(null)
          commonUtils.routeTo('/conceptset/' + result.id + '/expression')
        } finally {
          this.loading(false)
        }
      },
      isAssetDirty: () => this.currentConceptSetDirtyFlag().isDirty(),
      canAddComments: () => this.canEdit()
    })

    this.warningParams = ko.observable({
      current: this.currentConceptSet,
      warningsTotal: ko.observable(0),
      warningCount: ko.observable(0),
      infoCount: ko.observable(0),
      criticalCount: this.criticalCount,
      changeFlag: ko.pureComputed(() => this.currentConceptSetDirtyFlag().isChanged()),
      isDiagnosticsRunning: this.isDiagnosticsRunning,
      onDiagnoseCallback: this.diagnose.bind(this),
    })

    this.tabs = [
      {
        title: ko.i18n('cs.manager.tabs.conceptSetExpression', 'Concept Set Expression'),
        key: ViewMode.EXPRESSION,
        componentName: 'conceptset-expression',
        componentParams: {
          ...params,
          tableOptions,
          canEditCurrentConceptSet: this.canEdit,
          conceptSetStore: this.conceptSetStore,
        },
      },
      {
        title: ko.i18n('cs.manager.tabs.includedConcepts', 'Included Concepts'),
        key: ViewMode.INCLUDED,
        componentName: 'conceptset-list-included',
        componentParams: {
          ...params,
          tableOptions,
          canEdit: this.canEdit,
          currentConceptSet: this.conceptSetStore.current,
          selectedSource: this.selectedSource,
          conceptSetStore: this.conceptSetStore,
          loading: this.conceptSetStore.loadingIncluded
        },
        hasBadge: true,
      },
      {
        title: ko.i18n('cs.manager.tabs.includedSourceCodes', 'Source Codes'),
        key: ViewMode.SOURCECODES,
        componentName: 'conceptset-list-included-sourcecodes',
        componentParams: {
          ...params,
          tableOptions,
          canEdit: this.canEdit,
          conceptSetStore: this.conceptSetStore,
          selectedSource: this.selectedSource,
          loading: this.conceptSetStore.loadingSourceCodes
        },
      },
      {
        title: ko.i18n('cs.manager.tabs.recommend', 'Recommend'),
        key: ViewMode.RECOMMEND,
        componentName: 'conceptset-recommend',
        componentParams: {
          ...params,
          tableOptions,
          canEdit: this.canEdit,
          conceptSetStore: this.conceptSetStore,
          selectedSource: this.selectedSource,
          loading: this.conceptSetStore.loadingRecommended
        }
      },
      {
        title: ko.i18n('cs.manager.tabs.exploreEvidence', 'Explore Evidence'),
        key: ViewMode.EXPLORE,
        componentName: 'explore-evidence',
        componentParams: {
          ...params,
          saveConceptSet: this.saveConceptSet,
        },
        hidden: () => !sharedState.evidenceUrl() || !!this.previewVersion()
      },
      {
        title: ko.i18n('cs.manager.tabs.export', 'Export'),
        key: ViewMode.EXPORT,
        componentName: 'conceptset-list-export',
        componentParams: { ...params, canEdit: this.canEdit, conceptSetStore: this.conceptSetStore },
        hidden: () => !!this.previewVersion()
      },
      {
        title: ko.i18n('cs.manager.tabs.import', 'Import'),
        key: ViewMode.IMPORT,
        componentName: 'conceptset-list-import',
        componentParams: {
          ...params,
          canEdit: this.canEdit,
          conceptSetStore: this.conceptSetStore,
          loadConceptSet: this.loadConceptSet,
          activeConceptSet: ko.observable(this.conceptSetStore),
        },
        hidden: () => !!this.previewVersion()
      },
      {
        title: ko.i18n('cs.manager.tabs.compare', 'Compare'),
        key: ViewMode.COMPARE,
        componentName: 'conceptset-compare',
        componentParams: {
          ...params,
          saveConceptSetFn: this.saveConceptSet,
          selectedSource: this.selectedSource,
          saveConceptSetShow: this.saveConceptSetShow,
        },
        hidden: () => !!this.previewVersion()
      },
      {
        title: ko.i18n('cs.manager.tabs.annotation', 'Annotation'),
        key: ViewMode.ANNOTATION,
        componentName: 'conceptset-annotation',
        componentParams: {
          getList: () => this.currentConceptSet().id ? conceptSetService.getConceptSetAnnotation(this.currentConceptSet().id) : [],
          delete: (annotationId) => annotationId ? conceptSetService.deleteConceptSetAnnotation(this.currentConceptSet().id, annotationId) : null,
          canDeleteAnnotations: this.canDeleteAnnotations,
        }
      },
      {
        title: ko.i18n('cs.manager.tabs.versions', 'Versions'),
        key: ViewMode.VERSIONS,
        componentName: 'versions',
        componentParams: this.versionsParams,
      },
      {
        title: ko.i18n('cs.manager.tabs.messages', 'Messages'),
        key: ViewMode.MESSAGES,
        componentName: 'warnings',
        componentParams: this.warningParams,
        hasBadge: true,
        preload: true,
      },
      {
        title: ko.i18n('cs.manager.tabs.resolve-mappings', 'Resolve mappings'),
        key: ViewMode.MAPPINGS,
        componentName: 'resolve-mappings',
        componentParams: {
          ...params,
          canEdit: this.canEdit,
          conceptSetStore: this.conceptSetStore,
          selectedSource: this.selectedSource,
          loading: this.conceptSetStore.loadingIncluded,
        },
      },
    ]
    this.selectedTab = ko.observable(0)

    this.activeUtility = ko.observable('')
    this.newConceptSetIdForCopyAnnotations = ko.observable(0)

    GlobalPermissionService.decorateComponent(this, {
      entityTypeGetter: () => entityType.CONCEPT_SET,
      entityIdGetter: () => this.currentConceptSet() && this.currentConceptSet().id,
      createdByUsernameGetter: () => this.currentConceptSet() && this.currentConceptSet().createdBy &&
			this.currentConceptSet().createdBy.login
    })

    this.tags = ko.observableArray(this.currentConceptSet() && this.currentConceptSet().tags)
    TagsService.decorateComponent(this, {
      assetTypeGetter: () => TagsService.ASSET_TYPE.CONCEPT_SET,
      assetGetter: () => this.currentConceptSet(),
      addTagToAsset: (tag) => {
        const isDirty = this.currentConceptSetDirtyFlag().isDirty()
        this.currentConceptSet().tags.push(tag)
        this.tags(this.currentConceptSet().tags)
        if (!isDirty) {
          this.currentConceptSetDirtyFlag().reset()
          this.warningParams.valueHasMutated()
        }
      },
      removeTagFromAsset: (tag) => {
        const isDirty = this.currentConceptSetDirtyFlag().isDirty()
        this.currentConceptSet().tags = this.currentConceptSet().tags
          .filter(t => t.id !== tag.id && tag.groups.filter(tg => tg.id === t.id).length === 0)
        this.tags(this.currentConceptSet().tags)
        if (!isDirty) {
          this.currentConceptSetDirtyFlag().reset()
          this.warningParams.valueHasMutated()
        }
      }
    })

    this.conceptSetStore.isEditable(this.canEdit())
    this.subscriptions.push(this.conceptSetStore.observer.subscribe(async () => {
      // when the conceptSetStore changes (either through a new concept set being loaded or changes to concept set options), the concept set resolves and the view is refreshed.
      // this must be done within the same subscription due to the asynchronous nature of the AJAX and UI interface (ie: user can switch tabs at any time)
      try {
        await this.conceptSetStore.resolveConceptSetExpression()
        await this.conceptSetStore.refresh(this.tabs[this.selectedTab() || 0].key)
      } catch (err) {
        if (err == RESOLVE_OUT_OF_ORDER) { console.info(err) } else { throw (err) }
      }
    }))

    // initially resolve the concept set
    this.conceptSetStore.resolveConceptSetExpression().then(() => this.conceptSetStore.refresh(this.tabs[this.selectedTab() || 0].key))
  }

  onRouterParamsChanged (params, newParams) {
    const { conceptSetId, mode, version } = Object.assign({}, params, newParams)
    this.changeMode(conceptSetId, mode, version)
    if (mode !== undefined) {
      this.selectedTab(this.getIndexByMode(mode))
    }
  }

  backToCurrentVersion () {
    if (this.currentConceptSetDirtyFlag().isDirty() && !confirm(ko.i18n('common.unsavedWarning', 'Unsaved changes will be lost. Proceed?')())) {
      return
    }
    commonUtils.routeTo(`/conceptset/${this.currentConceptSet().id}/version/current`)
  }

  async changeMode (conceptSetId, mode, version) {
    if (conceptSetId !== undefined) {
      await this.loadConceptSet(conceptSetId, version)
    }
    await this.conceptSetStore.refresh(mode)
  }

  renderCheckbox (field, readonly = false) {
    return this.canEdit() && !readonly
      ? `<span data-bind="click: d => $parent.toggleCheckbox(d, '${field}'), css: { selected: ${field} }" class="fa fa-check"></span>`
      : `<span data-bind="css: { selected: ${field}}" class="fa fa-check readonly"></span>`
  }

  toggleCheckbox (d, field) {
    commonUtils.toggleConceptSetCheckbox(
      this.canEdit,
      this.optimalConceptSet,
      d,
      field
    )
  }

  async loadConceptSet (conceptSetId, version) {
    this.loading(true)
    sharedState.activeConceptSet(this.conceptSetStore)
    if (conceptSetId === 0 && !this.currentConceptSet()) {
      conceptSetUtils.createRepositoryConceptSet(this.conceptSetStore)
      this.loading(false)
    }
    if (this.currentConceptSet() && this.currentConceptSet().id === conceptSetId && !version) {
      this.loading(false)
      return
    }
    if (version && this.previewVersion() && this.previewVersion().version === parseInt(version)) {
      this.loading(false)
      return
    }
    try {
      this.hasPrioritySourceAccess(true)
      let conceptSet, expression
      if (version && version !== 'current') {
        const conceptSetVersion = await conceptSetService.getVersion(conceptSetId, version)
        conceptSet = conceptSetVersion.entityDTO
        expression = await conceptSetService.getVersionExpression(conceptSetId, version)
        this.previewVersion(conceptSetVersion.versionDTO)
      } else {
        this.previewVersion(null)
        conceptSet = await conceptSetService.loadConceptSet(conceptSetId)
        expression = await conceptSetService.loadConceptSetExpression(conceptSetId)
      }
      conceptSet.expression = _.isEmpty(expression) ? { items: [] } : expression
      sharedState.RepositoryConceptSet.current({ ...conceptSet, ...(new ConceptSet(conceptSet)) })
      this.conceptSetStore.current(sharedState.RepositoryConceptSet.current())
      this.conceptSetStore.isEditable(this.canEdit())
      this.tags(this.currentConceptSet().tags)
    } catch (err) {
      if (err.status === 403) {
        this.hasPrioritySourceAccess(false)
      }
    }
    this.loading(false)
  }

  dispose () {
    super.dispose()
    this.onConceptSetModeChanged && this.onConceptSetModeChanged.dispose()
    this.fade(false) // To close modal immediately, otherwise backdrop will freeze and remain at new page
    this.isOptimizeModalShown(false)
    this.conceptSetCaption.dispose()
  }

  removeDataFilterStorage () {
    localStorage.removeItem('filter-data')
    localStorage.removeItem('filter-source')
    localStorage.removeItem('data-remove-selected-concept')
    localStorage.removeItem('data-add-selected-concept')
  }

  objectMap (obj) {
    const newObject = {}
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === 'object') {
        newObject[key] = JSON.stringify(obj[key])
      } else {
        newObject[key] = obj[key]
      }
    })
    return newObject
  }

  handleConvertDataToString (arr) {
    const newDatas = [];
    (arr || []).forEach(item => {
      newDatas.push(this.objectMap(item))
    })
    return newDatas
  }

  async saveConceptSet (conceptSet, nameElementId) {
    if (this.previewVersion() && !confirm(ko.i18n('common.savePreviewWarning', 'Save as current version?')())) {
      return
    }
    this.isSaving(true)
    this.loading(true)
    const conceptSetName = conceptSet.name()
    conceptSet.name(conceptSetName.trim())
    // Next check to see that a concept set with this name does not already exist
    // in the database. Also pass the conceptSetId so we can make sure that the
    // current concept set is excluded in this check.
    const conceptSetItems = utils.toRepositoryConceptSetItems(conceptSet.expression.items())
    try {
      const results = await conceptSetService.exists(conceptSet.name(), conceptSet.id)
      if (results > 0) {
        this.raiseConceptSetNameProblem(ko.i18n('cs.manager.csAlreadyExistsMessage', 'A concept set with this name already exists. Please choose a different name.')(), nameElementId)
      } else {
        const savedConceptSet = await conceptSetService.saveConceptSet(conceptSet)
        const savedVersions = await this.versionsParams()?.getList()
        let latestSavedVersion = 1

        if (savedVersions && Array.isArray(savedVersions)) {
          latestSavedVersion = savedVersions.reduce((max, obj) => Math.max(max, obj.version), 1)
        }

        const annotationDataToAdd = JSON.parse(localStorage?.getItem('data-add-selected-concept') || null) || []
        const enrichedAnnotationDataToAdd = annotationDataToAdd.map(item => ({ ...item, conceptSetVersion: latestSavedVersion }))

        await conceptSetService.saveConceptSetItems(savedConceptSet.data.id, conceptSetItems)
        await conceptSetService.saveConceptSetAnnotation(savedConceptSet.data.id, { newAnnotation: this.handleConvertDataToString(enrichedAnnotationDataToAdd), removeAnnotation: this.handleConvertDataToString(JSON.parse(localStorage?.getItem('data-remove-selected-concept') || null) || []) })
        this.removeDataFilterStorage()

        const current = this.conceptSetStore.current()
        current.modifiedBy = savedConceptSet.data.modifiedBy
        current.modifiedDate = savedConceptSet.data.modifiedDate
        this.newConceptSetIdForCopyAnnotations(savedConceptSet.data.id)
        this.conceptSetStore.current(current)

        this.previewVersion(null)

        commonUtils.routeTo('/conceptset/' + savedConceptSet.data.id + '/expression')
      }
    } catch (e) {
      alert(ko.i18n('cs.manager.csSaveErrorMessage', 'An error occurred while attempting to save a concept set.')())
    } finally {
      this.loading(false)
      this.isSaving(false)
    }
  }

  raiseConceptSetNameProblem (msg, elem) {
    alert(msg)
    $(elem).select().focus()
  }

  closeConceptSet () {
    if (this.currentConceptSetDirtyFlag().isDirty() &&
			!confirm(ko.unwrap(ko.i18n('cs.manager.csNotSavedConfirmMessage', 'Your concept set changes are not saved. Would you like to continue?')))) {

    } else {
      this.conceptSetStore.clear()
      if (this.conceptSetStore == sharedState.activeConceptSet()) {
        sharedState.activeConceptSet(null)
      }
      this.currentConceptSetDirtyFlag().reset()
      sharedState.RepositoryConceptSet.current(null)
      this.previewVersion(null)
      commonUtils.routeTo('/conceptsets')
    }
  }

  async save () {
    await this.saveConceptSet(this.currentConceptSet(), '#txtConceptSetName')
    this.currentConceptSetDirtyFlag().reset()
  }

  async copy () {
    const sourceConceptSetId = this.currentConceptSet().id
    const responseWithName = await conceptSetService.getCopyName(this.currentConceptSet().id)
    this.currentConceptSet().name(responseWithName.copyName)
    this.currentConceptSet().id = 0
    this.currentConceptSetDirtyFlag().reset()
    await this.saveConceptSet(this.currentConceptSet(), '#txtConceptSetName')
    const copyAnnotationsRequest = {
      sourceConceptSetId,
      targetConceptSetId: this.newConceptSetIdForCopyAnnotations(),
    }
    await conceptSetService.copyAnnotations(copyAnnotationsRequest)
  }

  async optimize () {
    this.isOptimizing(true)
    this.activeUtility('optimize')
    this.optimizeLoading(true)
    this.optimalConceptSet(null)
    this.optimizerRemovedConceptSet(null)
    this.isOptimizeModalShown(true)

    const conceptSetItems = ko.toJS(this.conceptSetStore.current().expression)

    const optimizationResults = await vocabularyAPI.optimizeConceptSet(conceptSetItems)

    const optimizedConcepts = (optimizationResults.optimizedConceptSet.items || []).map(item => new ConceptSetItem(item))

    const removedConcepts = optimizationResults.removedConceptSet.items || []

    this.optimalConceptSet(optimizedConcepts)
    this.optimizerRemovedConceptSet(removedConcepts)
    this.optimizeLoading(false)
    this.activeUtility('')
    this.isOptimizing(false)
  }

  delete () {
    if (!confirm(ko.unwrap(ko.i18n('cs.manager.csDeleteConfirmMessage', 'Delete concept set? Warning: deletion can not be undone!')))) { return }

    this.isDeleting(true)
    // reset view after save
    conceptSetService.deleteConceptSet(this.currentConceptSet().id)
      .then(() => {
        this.currentConceptSetDirtyFlag().reset() // so that we don't get a 'unsaved' warning when we close.
        this.closeConceptSet()
      })
  }

  getIndexByMode (mode = ViewMode.EXPRESSION) {
    let index = this.tabs
      .map(tab => tab.key)
      .indexOf(mode)
    if (index === -1) {
      index = 0
    }

    return index
  }

  getModeByTabIndex (idx) {
    return this.tabs[idx] ? this.tabs[idx].key : this.tabs[0].key
  }

  selectTab (index) {
    const id = this.currentConceptSet()
      ? this.currentConceptSet().id
      : 0
    const mode = this.getModeByTabIndex(index)
    !!mode && commonUtils.routeTo(constants.paths.mode(id, mode))
  }

  async overwriteConceptSet () {
    this.currentConceptSet().expression.items(this.optimalConceptSet())
    this.isOptimizeModalShown(false)
  }

  copyOptimizedConceptSet () {
    this.optimizerSavingNewName(this.currentConceptSet().name() + ' - OPTIMIZED')
    this.optimizerSavingNew(true)
  }

  async saveNewOptimizedConceptSet () {
    this.optimizerSavingNew(false)
    this.isOptimizeModalShown(false)
    const conceptSet = {
      id: 0,
      name: this.optimizerSavingNewName(),
      expression: {
        items: ko.toJS(this.optimalConceptSet())
      }
    }
    await this.saveConceptSet(new ConceptSet(conceptSet), '#txtOptimizerSavingNewName')
  }

  cancelSaveNewOptimizedConceptSet () {
    this.optimizerSavingNew(false)
  }

  getAuthorship () {
    const conceptSet = this.currentConceptSet()

    let createdText, createdBy, createdDate, modifiedBy, modifiedDate

    if (this.previewVersion()) {
      createdText = ko.i18n('components.authorship.versionCreated', 'version created')
      createdBy = lodash.get(this.previewVersion(), 'createdBy.name')
      createdDate = commonUtils.formatDateForAuthorship(this.previewVersion().createdDate)
      modifiedBy = null
      modifiedDate = null
    } else {
      createdText = ko.i18n('components.authorship.created', 'created')
      createdBy = lodash.get(conceptSet, 'createdBy.name')
      createdDate = commonUtils.formatDateForAuthorship(conceptSet.createdDate)
      modifiedBy = lodash.get(conceptSet, 'modifiedBy.name')
      modifiedDate = commonUtils.formatDateForAuthorship(conceptSet.modifiedDate)
    }

    if (!createdBy) {
      createdBy = ko.i18n('common.anonymous', 'anonymous')
    }

    if (modifiedDate && !modifiedBy) {
      modifiedBy = ko.i18n('common.anonymous', 'anonymous')
    }

    return {
      createdText,
      createdBy,
      createdDate,
      modifiedBy,
      modifiedDate,
    }
  }

  diagnose () {
    if (this.currentConceptSet()) {
      return conceptSetService.runDiagnostics(this.currentConceptSet())
    }
  }
}
export default commonUtils.build('conceptset-manager', ConceptsetManager, view)

