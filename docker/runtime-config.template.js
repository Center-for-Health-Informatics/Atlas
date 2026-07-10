// This file is a shell template, substituted by docker/30-atlas-env-subst.sh
// (sed-based) at container start, before it ever runs as real JS -- each
// double-at-sign-wrapped identifier below is a placeholder, not a JS
// identifier. Don't write one of those placeholder-shaped tokens in this
// comment itself -- the substitution script matches them wherever they
// appear, comments included. isTrue() exists so flag comparisons are call
// expressions rather than literal-vs-literal comparisons, which keeps this
// file genuinely valid, lint-clean JS both before and after substitution.
const isTrue = value => value === 'true'

window.ATLAS_RUNTIME_CONFIG = (function () {
  const configLocal = {}

  if (isTrue('@@ATLAS_CLEAR_LOCAL_STORAGE@@')) {
    localStorage.clear()
  }

  let webapiUrl = '@@WEBAPI_URL@@'

  if (isTrue('@@USE_DYNAMIC_WEBAPI_URL@@')) {
    // Same server, different path -- keep protocol/host/port from the page's
    // own URL, just point the path at the WebAPI suffix.
    const dynamicUrl = new URL(window.location.href)
    dynamicUrl.pathname = '@@DYNAMIC_WEBAPI_SUFFIX@@'
    dynamicUrl.search = ''
    dynamicUrl.hash = ''
    webapiUrl = dynamicUrl.href
  }

  // WebAPI
  configLocal.api = {
    name: '@@ATLAS_INSTANCE_NAME@@',
    url: webapiUrl
  }

  configLocal.cohortComparisonResultsEnabled = isTrue('@@ATLAS_COHORT_COMPARISON_RESULTS_ENABLED@@')
  configLocal.plpResultsEnabled = isTrue('@@ATLAS_PLP_RESULTS_ENABLED@@')
  configLocal.userAuthenticationEnabled = isTrue('@@ATLAS_USER_AUTH_ENABLED@@')
  configLocal.authProviders = []
  configLocal.enablePermissionManagement = isTrue('@@ATLAS_ENABLE_PERMISSIONS_MGMT@@')
  configLocal.cacheSources = isTrue('@@ATLAS_CACHE_SOURCES@@')
  configLocal.enableSkipLogin = isTrue('@@ATLAS_SKIP_LOGIN@@') // automatically opens login window when user is not authenticated
  configLocal.useExecutionEngine = isTrue('@@ATLAS_USE_EXECUTION_ENGINE@@')
  configLocal.viewProfileDates = isTrue('@@ATLAS_VIEW_PROFILE_DATES@@')
  configLocal.enableCosts = isTrue('@@ATLAS_ENABLE_COSTS@@')
  configLocal.supportUrl = '@@ATLAS_SUPPORT_URL@@'
  configLocal.supportMail = '@@ATLAS_SUPPORT_MAIL@@'
  configLocal.feedbackContacts = '@@ATLAS_FEEDBACK_CONTACTS@@'
  configLocal.feedbackCustomHtmlTemplate = '@@ATLAS_FEEDBACK_HTML@@'
  configLocal.companyInfoCustomHtmlTemplate = '@@ATLAS_COMPANYINFO_HTML@@'
  configLocal.showCompanyInfo = isTrue('@@ATLAS_COMPANYINFO_SHOW@@')
  configLocal.defaultLocale = '@@ATLAS_DEFAULT_LOCALE@@'
  configLocal.pollInterval = parseInt('@@ATLAS_POLL_INTERVAL@@')

  if (isTrue('@@ATLAS_SECURITY_WIN_PROVIDER_ENABLED@@')) {
    configLocal.authProviders.push({
      name: '@@ATLAS_SECURITY_WIN_PROVIDER_NAME@@',
      url: '@@ATLAS_SECURITY_WIN_PROVIDER_URL@@',
      ajax: isTrue('@@ATLAS_SECURITY_WIN_PROVIDER_AJAX@@'),
      icon: '@@ATLAS_SECURITY_WIN_PROVIDER_ICON@@'
    })
  }

  if (isTrue('@@ATLAS_SECURITY_KERB_PROVIDER_ENABLED@@')) {
    configLocal.authProviders.push({
      name: '@@ATLAS_SECURITY_KERB_PROVIDER_NAME@@',
      url: '@@ATLAS_SECURITY_KERB_PROVIDER_URL@@',
      ajax: isTrue('@@ATLAS_SECURITY_KERB_PROVIDER_AJAX@@'),
      icon: '@@ATLAS_SECURITY_KERB_PROVIDER_ICON@@'
    })
  }

  if (isTrue('@@ATLAS_SECURITY_OID_PROVIDER_ENABLED@@')) {
    configLocal.authProviders.push({
      name: '@@ATLAS_SECURITY_OID_PROVIDER_NAME@@',
      url: '@@ATLAS_SECURITY_OID_PROVIDER_URL@@',
      ajax: isTrue('@@ATLAS_SECURITY_OID_PROVIDER_AJAX@@'),
      icon: '@@ATLAS_SECURITY_OID_PROVIDER_ICON@@'
    })
  }

  if (isTrue('@@ATLAS_SECURITY_GGL_PROVIDER_ENABLED@@')) {
    configLocal.authProviders.push({
      name: '@@ATLAS_SECURITY_GGL_PROVIDER_NAME@@',
      url: '@@ATLAS_SECURITY_GGL_PROVIDER_URL@@',
      ajax: isTrue('@@ATLAS_SECURITY_GGL_PROVIDER_AJAX@@'),
      icon: '@@ATLAS_SECURITY_GGL_PROVIDER_ICON@@'
    })
  }

  if (isTrue('@@ATLAS_SECURITY_FB_PROVIDER_ENABLED@@')) {
    configLocal.authProviders.push({
      name: '@@ATLAS_SECURITY_FB_PROVIDER_NAME@@',
      url: '@@ATLAS_SECURITY_FB_PROVIDER_URL@@',
      ajax: isTrue('@@ATLAS_SECURITY_FB_PROVIDER_AJAX@@'),
      icon: '@@ATLAS_SECURITY_FB_PROVIDER_ICON@@'
    })
  }

  if (isTrue('@@ATLAS_SECURITY_GH_PROVIDER_ENABLED@@')) {
    configLocal.authProviders.push({
      name: '@@ATLAS_SECURITY_GH_PROVIDER_NAME@@',
      url: '@@ATLAS_SECURITY_GH_PROVIDER_URL@@',
      ajax: isTrue('@@ATLAS_SECURITY_GH_PROVIDER_AJAX@@'),
      icon: '@@ATLAS_SECURITY_GH_PROVIDER_ICON@@'
    })
  }

  if (isTrue('@@ATLAS_SECURITY_DB_PROVIDER_ENABLED@@')) {
    configLocal.authProviders.push({
      name: '@@ATLAS_SECURITY_DB_PROVIDER_NAME@@',
      url: '@@ATLAS_SECURITY_DB_PROVIDER_URL@@',
      ajax: isTrue('@@ATLAS_SECURITY_DB_PROVIDER_AJAX@@'),
      icon: '@@ATLAS_SECURITY_DB_PROVIDER_ICON@@',
      isUseCredentialsForm: isTrue('@@ATLAS_SECURITY_DB_PROVIDER_CREDFORM@@')
    })
  }

  if (isTrue('@@ATLAS_SECURITY_LDAP_PROVIDER_ENABLED@@')) {
    configLocal.authProviders.push({
      name: '@@ATLAS_SECURITY_LDAP_PROVIDER_NAME@@',
      url: '@@ATLAS_SECURITY_LDAP_PROVIDER_URL@@',
      ajax: isTrue('@@ATLAS_SECURITY_LDAP_PROVIDER_AJAX@@'),
      icon: '@@ATLAS_SECURITY_LDAP_PROVIDER_ICON@@',
      isUseCredentialsForm: isTrue('@@ATLAS_SECURITY_LDAP_PROVIDER_CREDFORM@@')
    })
  }

  if (isTrue('@@ATLAS_SECURITY_SAML_PROVIDER_ENABLED@@')) {
    configLocal.authProviders.push({
      name: '@@ATLAS_SECURITY_SAML_PROVIDER_NAME@@',
      url: '@@ATLAS_SECURITY_SAML_PROVIDER_URL@@',
      ajax: isTrue('@@ATLAS_SECURITY_SAML_PROVIDER_AJAX@@'),
      icon: '@@ATLAS_SECURITY_SAML_PROVIDER_ICON@@'
    })
  }

  // For existing broadsea implementations
  if (isTrue('@@ATLAS_SECURITY_PROVIDER_ENABLED@@')) {
    configLocal.authProviders.push({
      name: '@@ATLAS_SECURITY_PROVIDER_NAME@@',
      url: 'user/login/@@ATLAS_SECURITY_PROVIDER_TYPE@@',
      ajax: isTrue('@@ATLAS_SECURITY_PROVIDER_AJAX@@'),
      icon: '@@ATLAS_SECURITY_PROVIDER_ICON@@'
    })
  }

  configLocal.enableTermsAndConditions = isTrue('@@ATLAS_ENABLE_TANDCS@@')
  configLocal.enablePersonCount = isTrue('@@ATLAS_ENABLE_PERSONCOUNT@@')
  configLocal.enableTaggingSection = isTrue('@@ATLAS_ENABLE_TAGGING_SECTION@@')
  configLocal.refreshTokenThreshold = 1000 * 60 * parseInt('@@ATLAS_REFRESH_TOKEN_THRESHOLD@@')

  return configLocal
})()
