import $ from 'jquery'
import config from 'appConfig'

function getNegativeControls (sourceKey, conceptSetId) {
  const infoPromise = $.ajax({
    url: config.webAPIRoot + 'evidence/' + sourceKey + '/negativecontrols/' + (conceptSetId || '-1'),
    error: function (error) {
      console.log('Error: ' + error)
    }
  })
  return infoPromise
}

function getDrugLabelExists (sourceKey, conceptIds) {
  const infoPromise = $.ajax({
    url: config.webAPIRoot + 'evidence/' + sourceKey + '/druglabel',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(conceptIds),
    error: function (error) {
      console.log('Error: ' + error)
    }
  })
  return infoPromise
}

function getDrugConditionPairs (sourceKey, targetDomainId, drugConceptIds, conditionConceptIds, sourceIds) {
  const pairPromise = $.ajax({
    url: config.webAPIRoot + 'evidence/' + sourceKey + '/drugconditionpairs',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      targetDomain: targetDomainId,
      drugConceptIds,
      conditionConceptIds,
      sourceIds,
    })
  })
  return pairPromise
}

function generateNegativeControls (sourceKey, conceptSetId, conceptSetName, conceptDomainId, targetDomainId, conceptIds, csToInclude, csToExclude) {
  const negativeControlsJob = $.ajax({
    url: config.webAPIRoot + 'evidence/' + sourceKey + '/negativecontrols',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      jobName: 'NEGATIVE_CONTROLS_' + conceptSetId,
      conceptSetId,
      conceptSetName,
      conceptDomainId,
      outcomeOfInterest: targetDomainId,
      conceptsOfInterest: conceptIds,
      csToInclude,
      csToExclude,
      // translatedSchema: "translated",
    }),
    error: function (error) {
      console.log('Error: ' + error)
    }
  })

  return negativeControlsJob
}

const api = {
  getDrugConditionPairs,
  getDrugLabelExists,
  getNegativeControls,
  generateNegativeControls
}

export default api

